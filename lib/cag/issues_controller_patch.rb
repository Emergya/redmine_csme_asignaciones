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
		    	alias_method_chain :show, :assigned_group_show
		    	alias_method_chain :new, :assigned_group_new
		    	skip_before_filter :authorize, :only => [:get_users_group]
		  	end
		end

		module ClassMethods
		end

		module InstanceMethods
		    def show_with_assigned_group_show
		    	@assigned_groups = Group.order("lastname ASC").all.collect {|p| [p.lastname, p.id]}

		    	show_without_assigned_group_show
		    end

		     def new_with_assigned_group_new
		    	@assigned_groups = Group.order("lastname ASC").all.collect {|p| [p.lastname, p.id]}

		    	new_without_assigned_group_new
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