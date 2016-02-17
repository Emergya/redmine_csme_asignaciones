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
		    	before_filter :set_assigned_group, :only => [:show, :new, :update_form]
		    	skip_before_filter :authorize, :only => [:get_users_group]
		  	end
		end

		module ClassMethods
		end

		module InstanceMethods
			# Metodo que recoge todos los diferentes grupos de usuarios que exiten.
		    def set_assigned_group
		    	@assigned_groups = Group.order("lastname ASC").all.collect {|p| [p.lastname, p.id]}
		    end

		    # Metodo que devuelve en formato .json los usuarios que pertenecen a un determinado grupo.
		    def get_users_group
		    	group = Group.find(params[:group_id])
		    	group_users = group.users.collect{|p| [p.firstname+" "+p.lastname, p.id]}

		    	respond_to do |format|
		    		format.json { render json: {:users => group_users} }
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