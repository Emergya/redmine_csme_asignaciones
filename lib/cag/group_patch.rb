require_dependency 'group'
require 'dispatcher' unless Rails::VERSION::MAJOR >= 3

module CAG
  module GroupPatch
    def self.included(base) # :nodoc:
      base.extend(ClassMethods)
      base.send(:include, InstanceMethods)

      # Same as typing in the class
      base.class_eval do
        unloadable # Send unloadable so it will be reloaded in development
        has_many :issues, :dependent => :destroy
      end
    end

    module ClassMethods
    end

    module InstanceMethods
    end

  end
end
if Rails::VERSION::MAJOR >= 3
  ActionDispatch::Callbacks.to_prepare do
    # use require_dependency if you plan to utilize development mode
    Group.send(:include, CAG::GroupPatch)
  end
else
  Dispatcher.to_prepare do
    Group.send(:include, CAG::GroupPatch)
  end
end