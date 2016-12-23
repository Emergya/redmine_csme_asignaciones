require_dependency 'issue'
require 'dispatcher' unless Rails::VERSION::MAJOR >= 3

module CAG
  module IssuePatch
    def self.included(base) # :nodoc:
      base.extend(ClassMethods)
      base.send(:include, InstanceMethods)

      # Same as typing in the class
      base.class_eval do
        unloadable # Send unloadable so it will be reloaded in development
        belongs_to :group

        safe_attributes 'group_id',
          :if => lambda {|issue, user| issue.new_record? || user.allowed_to?(:edit_issues, issue.project) }

        safe_attributes 'group_id',
          :if => lambda {|issue, user| issue.new_statuses_allowed_to(user).any? }

        after_update :check_article_csme_into_gg_article
        class << self
          alias_method_chain :visible_condition, :group_issues
        end
        alias_method_chain :visible?, :group_issue
      end
    end

    module ClassMethods
      # Returns a SQL conditions string used to find all issues visible by the specified user
      def visible_condition_with_group_issues(user, options={})
        Project.allowed_to_condition(user, :view_issues, options) do |role, user|
          if user.logged?
            case role.issues_visibility
            when 'all'
              nil
            when 'default'
              user_ids = [user.id] + user.groups.map(&:id).compact
              "(#{table_name}.is_private = #{connection.quoted_false} OR #{table_name}.author_id = #{user.id} OR #{table_name}.assigned_to_id IN (#{user_ids.join(',')}))"
            when 'own'
              user_ids = [user.id] + user.groups.map(&:id).compact
              "(#{table_name}.author_id = #{user.id} OR #{table_name}.assigned_to_id IN (#{user_ids.join(',')}))"
            when 'group'
              user_ids = [user.id] + user.groups.map(&:id).compact
              "(#{table_name}.author_id = #{user.id} OR #{table_name}.assigned_to_id IN (#{user_ids.join(',')})) OR #{table_name}.group_id IN (#{user_ids.join(',')})"
            else
              '1=0'
            end
          else
            "(#{table_name}.is_private = #{connection.quoted_false})"
          end
        end
      end
    end

    module InstanceMethods

        # Returns true if usr or current user is allowed to view the issue
        def visible_with_group_issue?(usr=nil)
          (usr || User.current).allowed_to?(:view_issues, self.project) do |role, user|
            if user.logged?
              case role.issues_visibility
              when 'all'
                true
              when 'default'
                !self.is_private? || (self.author == user || user.is_or_belongs_to?(assigned_to))
              when 'own'
                self.author == user || user.is_or_belongs_to?(assigned_to)
              when 'group'
                user_groups = user.groups.map(&:id).compact
                user_groups.include? self.group_id
              else
                false
              end
            else
              !self.is_private?
            end
          end
        end

      def check_article_csme_into_gg_article
        # Comprobamos que se realice la validación en 'Análisis de información CSME'
        if IssueStatus.find(self.status_id).id == Setting.plugin_redmine_csme_asignaciones[:analysis_status].to_i
            # Guardamos los custom_values para validarlos.
            # Redmine por defecto no actualiza los campos personalizados, sino que los elimina y los crea de nuevo,
            # por lo que no es posible validar dichos campos si no se guardan a través del método save_custom_field_values.
            # ya que los campos personalizados no se guardan hasta que llega al callback de after_save (posterior a after_update).
            self.save_custom_field_values

            # Se obtiene los valores de los campos personalizados por los cuales se realizará la busqueda en gg_articles.
            code_article       = self.custom_values.where("custom_field_id = ?", Setting.plugin_redmine_csme_asignaciones[:setting_issue_article]).first.value
            code_type_material = self.custom_values.where("custom_field_id = ?", Setting.plugin_redmine_csme_asignaciones[:setting_issue_article_type]).first.value
            code_provider      = self.custom_values.where("custom_field_id = ?", Setting.plugin_redmine_csme_asignaciones[:setting_issue_provider]).first.value
            code_file          = self.custom_values.where("custom_field_id = ?", Setting.plugin_redmine_csme_asignaciones[:setting_issue_file]).first.value
            code_lot           = self.custom_values.where("custom_field_id = ?", Setting.plugin_redmine_csme_asignaciones[:setting_issue_lot]).first.value

            file = GgFile.where("code_file = ?", code_file).first
            # Si no existe ningún expediente se realiza un rollback.
            if file.nil?
              errors.add :base, l(:no_matches_files_csme)
              raise ActiveRecord::Rollback
            else
              articles = file.gg_articles.where("code_article = ? AND code_type_material = ? AND code_provider = ? AND lot = ?", code_article, code_type_material, code_provider, code_lot).count
              # Si no existe ningún artículo se realiza un rollback.
              if articles == 0
                errors.add :base, l(:no_matches_articles_csme)
                raise ActiveRecord::Rollback
              end
            end

            code_file_service = self.custom_values.where("custom_field_id = ?", Setting.plugin_redmine_csme_asignaciones[:setting_issue_file_guarantee]).first.value
            if !code_file_service.empty?
              file_service = GgFilesService.where("code_file_services = ?", code_file_service).first
              #Si no existe ningun expediente con dicho expediente de servicio.
              if file_service.nil?
                errors.add :base, l(:no_matches_files_services_csme)
                raise ActiveRecord::Rollback
              end
            end

        end
      end

    end

  end
end
if Rails::VERSION::MAJOR >= 3
  ActionDispatch::Callbacks.to_prepare do
    # use require_dependency if you plan to utilize development mode
    Issue.send(:include, CAG::IssuePatch)
  end
else
  Dispatcher.to_prepare do
    Issue.send(:include, CAG::IssuePatch)
  end
end