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
		    	skip_before_filter :authorize, :only => [:get_users_group, :get_status, :get_providers, :get_code_file, :get_provider_contact, :get_articles_csme, :get_article_csme, :get_files_services_csme, :get_file_service_csme, :modal_get_file_service_csme, :get_provider_id, :get_provider_contacts]
		  	end
		end

		module ClassMethods
		end

		module InstanceMethods
			# Recoge todos los diferentes grupos de usuarios que exiten.
		    def set_assigned_group
		    	@assigned_groups = Group.order("lastname ASC").all.collect {|p| [p.lastname, p.id]}
		    	# Si el estado no se encuentra en 'Asignada a proveedor' o 'Resuelta por proveedor'
		    	if (@issue.status.id != Setting.plugin_redmine_csme_asignaciones[:provider_status].to_i) && (@issue.status.id != Setting.plugin_redmine_csme_asignaciones[:st_provider_status].to_i)
		    		@assigned_groups.reject!{ |x| x[0] == l(:thecnical_service) } # Eliminamos el grupo 'Servicio Técnico'
		    	else
		    		@assigned_groups.reject!{ |x| x[0] != l(:thecnical_service) } # Eliminamos todos los grupos excepto 'Servicio Técnico'
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

		    # Devuelve en formato .json los estados configurados en el plugin.
		    def get_status
		    	provider_status    = Setting.plugin_redmine_csme_asignaciones[:provider_status] #Asignado a proveedor
		    	analysis_status    = Setting.plugin_redmine_csme_asignaciones[:analysis_status] # Análisis de información
		    	information_completed_status = Setting.plugin_redmine_csme_asignaciones[:information_completed_status] # Información completada
		    	st_provider_status = Setting.plugin_redmine_csme_asignaciones[:st_provider_status] # Solución temporal de proveedor
		    	r_provider_status  = Setting.plugin_redmine_csme_asignaciones[:r_provider_status] # Resuelta por proveedor
		    	rejected_status    = Setting.plugin_redmine_csme_asignaciones[:rejected_status] # Rechazada
		    	reopened_status    = Setting.plugin_redmine_csme_asignaciones[:reopened_status] # Reabierta
		    	resolved_status    = Setting.plugin_redmine_csme_asignaciones[:resolved_status] # Resuelta

		    	respond_to do |format|
		    		format.json { render json: { :provider_status => provider_status, 
		    									 :analysis_status => analysis_status,
		    									 :information_completed_status => information_completed_status,
		    									 :st_provider_status => st_provider_status,
		    									 :r_provider_status => r_provider_status,
		    									 :rejected_status => rejected_status,
		    									 :reopened_status => reopened_status,
		    									 :resolved_status => resolved_status } 
		    					}
		    	end
		    end

		    # Devuelve en formato .json el listado de los proveedores.
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

		    	get_articles = get_articles.order('name_provider ASC, name_article ASC')

    			respond_to do |format|
		    		format.json { render json: {:providers => get_articles.flatten} }
		    	end
		    end

		    # Devuelve en formato.json el codigo del expediente.
		    def get_code_file
		    	article = GgArticle.find params[:file_id]
		    	file = GgFile.select("code_file").find(article.gg_file_id)

		    	respond_to do |format|
		    		format.json { render json: {:code_file => file.code_file} }
		    	end
		    end

		    # Devuelve en formato .json el contacto de nivel 1 del proveedor.
		    def get_provider_contact
		    	article = GgArticle.find(params[:provider_id])
		    	contact = article.level_1.present? ? User.find(article.level_1) : nil

		    	respond_to do |format|
		    		format.json { render json: {:contact => contact.present? ? contact.attributes : nil} }
		    	end
		    end

		    # Devuelve en formato .json los articulos de gg_materials.
		    def get_articles_csme
				query_article = ""
				query_params = ""
				
				params[:article_csme].each_with_index do |prop_article, index|
					if !prop_article[1].empty?
						case prop_article[0]
						when 'article'
							query_article << "#{prop_article[0]} LIKE '%#{prop_article[1]}%' AND "
						else
							query_article << "#{prop_article[0]} = '#{prop_article[1]}' AND "
						end
					end	
				end

				query_article.chomp!(" AND ")
				articles_csme = GgMaterial.where(query_article).order("date_guarantee DESC, provider ASC, article ASC")

				respond_to do |format|
		    		format.json { render json: {:articles_csme => articles_csme} }
		    	end	    	
		    end

		    # Devuelve en formato .json el articulo de gg_materials.
		    def get_article_csme
		    	article_csme = GgMaterial.find(params[:article_csme_id])

		    	respond_to do |format|
		    		format.json { render json: {:article_csme => article_csme.present? ? article_csme.attributes : nil} }
		    	end
		    end

		    # Devuelve en formato .json los expedientes de servicios de gg_files_services.
		    def get_files_services_csme
		    	files_services_csme =  GgFilesService.where("code_file = ?", params[:code_file]).order("date_guarantee DESC")

		    	respond_to do |format|
		    		format.json { render json: {:files_services_csme => files_services_csme} }
		    	end
		    end

		    # Devuelve en formato .json el expediente de servicios de gg_files_services.
		    def get_file_service_csme
		    	file_service_csme =  GgFilesService.find(params[:file_service_csme_id])

		    	respond_to do |format|
		    		format.json { render json: {:files_services_csme => file_service_csme.present? ? file_service_csme.attributes : nil} }
		    	end
		    end

		    # Devuelve en formato .json el expediente de servicio.
		    def modal_get_file_service_csme
		    	code_file          = params[:article_csme][:code_file]
		    	code_provider      = params[:article_csme][:code_provider]
		    	code_article       = params[:article_csme][:code_article]
		    	code_type_material = params[:article_csme][:code_type_material]
		    	lot                = params[:article_csme][:lot]

		    	file_service_csme =  GgFilesService.where("code_file = ? AND key_file = ? AND code_article = ? AND code_type_material = ? AND lot = ?", code_file, code_provider, code_article, code_type_material, lot)
		    	
		    	respond_to do |format|
		    		format.json { render json: {:modal_file_service_csme => file_service_csme} }
		    	end
		    end

		    # Devuelve en formato .json el id del proveedor
		    def get_provider_id
		    	provider_code = params[:provider_code]
		    	article_code = params[:article_code]
		    	lot = params[:lot]

		    	article = GgArticle.where(code_provider: provider_code, code_article: article_code, lot: lot)

		    	respond_to do |format|
		    		format.json { render json: {:provider_id => (article.present? ? article.first.id : "")} }
		    	end
		    end

		    # Devuelve en formato .json los contactos del proveedor.
		    def get_provider_contacts
		    	article = GgArticle.find(params[:provider_id])

		    	contacts = []
		    	(1..3).each do |i|
			    	if article["level_#{i}".to_sym].present?
			    		contact = User.find_by_id(article["level_#{i}".to_sym])
			    		contacts << contact.attributes if contact.present?
			    	end
			    end

		    	respond_to do |format|
		    		format.json { render json: {:contacts => contacts.to_json} }
		    	end
		    end
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