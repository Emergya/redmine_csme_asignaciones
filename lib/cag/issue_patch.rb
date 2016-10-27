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
      end
    end

    module ClassMethods
    end

    module InstanceMethods

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

            file = GgFile.where("code_file = ?", code_file).first
            # Si no existe ningún expediente se realiza un rollback.
            if file.nil?
              errors.add :base, l(:no_matches_files_csme)
              raise ActiveRecord::Rollback
            else
              articles = file.gg_articles.where("code_article = ? AND code_type_material = ? AND code_provider = ?", code_article, code_type_material, code_provider).count
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