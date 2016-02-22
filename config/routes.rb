# Plugin's routes
# See: http://guides.rubyonrails.org/routing.html
RedmineApp::Application.routes.draw do
	# Ruta para obtener los usuarios que pertenecen a un grupo a través de AJAX
	get '/get_users_group', to: 'issues#get_users_group', as: 'get_users_group'

	# Ruta para obtener el estado que estan asignado para los proveedores a través de AJAX
	get '/get_provider_status', to: 'issues#get_provider_status', as: 'get_provider_status'
	
	# Ruta para obtener los proveedores a través de AJAX
	get '/get_providers', to: 'issues#get_providers', as: 'get_providers'

	# Ruta para obtener el código del expediente a través de AJAX
	get '/get_code_file', to: 'issues#get_code_file', as: 'get_code_file'

	# Ruta para obtener el contacto del proveedor a través de AJAX
	get '/get_provider_contact', to: 'issues#get_provider_contact', as: 'get_provider_contact'
end