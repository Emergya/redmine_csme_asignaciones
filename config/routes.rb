# Plugin's routes
# See: http://guides.rubyonrails.org/routing.html
RedmineApp::Application.routes.draw do
	# Ruta para obtener los usuarios que pertenecen a un grupo a través de una peticion AJAX
	get '/get_users_group', to: 'issues#get_users_group', as: 'get_users_group'
end