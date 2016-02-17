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
    Issue.send(:include, CAG::IssuePatch)
  end
else
  Dispatcher.to_prepare do
    Issue.send(:include, CAG::IssuePatch)
  end
end