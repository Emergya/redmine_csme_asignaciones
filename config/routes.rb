# Plugin's routes
# See: http://guides.rubyonrails.org/routing.html
RedmineApp::Application.routes.draw do
	# Ruta para obtener los usuarios que pertenecen a un grupo a través de AJAX
	get '/get_users_group', to: 'issues#get_users_group', as: 'get_users_group'

	# Ruta para obtener los estaods a través de AJAX
	get '/get_status', to: 'issues#get_status', as: 'get_status'
	
	# Ruta para obtener los proveedores a través de AJAX
	get '/get_providers', to: 'issues#get_providers', as: 'get_providers'

	# Ruta para obtener el código del expediente a través de AJAX
	get '/get_code_file', to: 'issues#get_code_file', as: 'get_code_file'

	# Ruta para obtener el contacto del proveedor a través de AJAX
	get '/get_provider_contact', to: 'issues#get_provider_contact', as: 'get_provider_contact'

	# Ruta para obtener los articulos de la tabla ISE_MATERIAL_DISTRIBUIDO_GAR a través de AJAX
	get '/get_articles_csme', to: 'issues#get_articles_csme', as: 'get_articles_csme'

	# Ruta para obtener el artículo de la tabla ISE_MATERIAL_DISTRIBUIDO_GAR a través de AJAX
	get '/get_article_csme', to: 'issues#get_article_csme', as: 'get_article_csme'
end