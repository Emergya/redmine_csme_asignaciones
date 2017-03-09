module ActiveRecord
  class Base

    Role::ISSUES_VISIBILITY_OPTIONS = [
        ['all', :label_issues_visibility_all],
        ['default', :label_issues_visibility_public],
        ['own', :label_issues_visibility_own],
        ['group', :label_issues_same_group],
    	['province', :label_issues_same_province]]
        
    Role::_validators[:issues_visibility].first.options[:in] << 'group' #= Role::ISSUES_VISIBILITY_OPTIONS.collect(&:first)
    Role::_validators[:issues_visibility].first.options[:in] << 'province'

  end

end
