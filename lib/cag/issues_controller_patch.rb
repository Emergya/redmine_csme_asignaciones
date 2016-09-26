require_dependency 'issues_controller'
require 'dispatcher' unless Rails::VERSION::MAJOR >= 3

module CAG
	module IssuesControllerPatch
	    def self.included(base) # :nodoc:
			base.extend(ClassMethods)
			base.send(:include, InstanceMethods)

			# Same as typing in the class
			base.class_eval do
		    	unloadable  # Send unloadable so it will be reloaded in development
		    	before_filter :set_assigned_group, :only => [:show, :new, :update_form, :update, :create]
		    	skip_before_filter :authorize, :only => [:get_users_group, :get_status, :get_providers, :get_code_file, :get_provider_contact, :get_articles_csme]
		  	end
		end

		module ClassMethods
		end

		module InstanceMethods
			# Recoge todos los diferentes grupos de usuarios que exiten.
		    def set_assigned_group
		    	@assigned_groups = Group.order("lastname ASC").all.collect {|p| [p.lastname, p.id]}

		    	if @issue.status.id != Setting.plugin_redmine_csme_asignaciones[:provider_status].to_i
		    		@assigned_groups.reject!{ |x| x[0] == l(:thecnical_service) }
		    	else
		    		@assigned_groups.reject!{ |x| x[0] != l(:thecnical_service) }
		    	end
		    end

		    # Devuelve en formato .json los usuarios que pertenecen a un determinado grupo.
		    def get_users_group
		    	if params[:group_id].present?
			    	group = Group.find(params[:group_id])
			    	group_users = group.users.collect{|p| [p.firstname+" "+p.lastname, p.id]}

			    	respond_to do |format|
			    		format.json { render json: {:users => group_users} }
			    	end
			    else
			    	respond_to do |format|
			    		format.json { render json: {:users => []} }
			    	end
			    end
		    end

		    # Devuelve en formato .json los estados configurados en el plugin
		    def get_status
		    	provider_status = Setting.plugin_redmine_csme_asignaciones[:provider_status]
		    	analysis_status = Setting.plugin_redmine_csme_asignaciones[:analysis_status]

		    	respond_to do |format|
		    		format.json { render json: {:provider_status => provider_status, :analysis_status => analysis_status} }
		    	end
		    end

		    # Devuelve en formato .json el listado de los proveedores
		    def get_providers
		    	cod_file     = params[:cod_file]
		    	cod_article  = params[:cod_article]
		    	cod_provider = params[:cod_provider]

		    	get_articles = []

		    		# COMBINACIONES POSIBLES
		    		# [1.1] file - article - provider
		    		# [2.2] file - provider
		    		# [2.1] file - article
		    		# [2.3] file
		    		# [1.1] article - provider
		    		# [3.1] article
		    		# [3.1] provider
		    		# [3.2] todo empty

		    	if !cod_article.empty? && !cod_provider.empty? # 1.1
		    		get_articles = GgArticle.where("code_article = ? AND code_provider = ?", cod_article, cod_provider)
		    	elsif !cod_file.empty?
		    		if !cod_article.empty? # 2.1
		    			get_articles = GgArticle.joins(:gg_file).where("gg_articles.code_article = ? AND gg_files.code_file = ?", cod_article, cod_file)
		    		elsif !cod_provider.empty? # 2.2
		    			get_articles = GgArticle.joins(:gg_file).where("gg_articles.code_provider = ? AND gg_files.code_file = ?", cod_provider, cod_file)
		    		else # 2.3
		    			get_articles = GgArticle.joins(:gg_file).where("gg_files.code_file = ?", cod_file)
		    		end
		    	elsif cod_file.empty? && ( !cod_article.empty? || !cod_provider.empty?) # 3.1
		    		get_articles = GgArticle.where("code_article = ?", cod_article) if !cod_article.empty?
		    		get_articles = GgArticle.where("code_provider = ?", cod_provider) if !cod_provider.empty?
		    	end

    			respond_to do |format|
		    		format.json { render json: {:providers => get_articles.flatten} }
		    	end
		    end

		    # Devuelve en formato.json el codigo del expediente
		    def get_code_file
		    	article = GgArticle.find params[:file_id]
		    	file = GgFile.select("code_file").find(article.gg_file_id)

		    	respond_to do |format|
		    		format.json { render json: {:code_file => file.code_file} }
		    	end
		    end

		    # Devuelve en formato .json el contacto de nivel 1 del proveedor
		    def get_provider_contact
		    	article = GgArticle.find(params[:provider_id])
		    	contact = article.level_1.present? ? User.find(article.level_1) : nil

		    	respond_to do |format|
		    		format.json { render json: {:contact => contact.present? ? contact.attributes : nil} }
		    	end
		    end

		    # def get_articles_csme
		    	
		    # end
		end
	end
end

if Rails::VERSION::MAJOR >= 3
  ActionDispatch::Callbacks.to_prepare do
    IssuesController.send(:include, CAG::IssuesControllerPatch)
  end
else
  Dispatcher.to_prepare do
    IssuesController.send(:include, CAG::IssuesControllerPatch)
  end
end