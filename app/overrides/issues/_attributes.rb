Deface::Override.new :virtual_path  => 'issues/_attributes',
                     :name          => 'add_assigned_to_group_edit',
                     :original		=> 'fcca283a4a13bf49f03ef4ac43e87fdab8181adf',
                     :insert_before => "erb[silent]:contains(\"if @issue.safe_attribute? 'assigned_to_id'\")",
                     :partial       => 'issues/partials/assigned_to_group_edit'

Deface::Override.new :virtual_path  => 'issues/_attributes',
                     :name          => 'reload_assigned_to',
                     :original		=> '70c4ccfa4598090b4bd2884521d9f92a1ec1977a',
                     :replace       => "erb[loud]:contains(\"f.select :assigned_to_id, principals_options_for_select(@issue.assignable_users, @issue.assigned_to), :include_blank => true, :required => @issue.required_attribute?('assigned_to_id')\")",
                     :text          => "<%= f.select :assigned_to_id, principals_options_for_select(@issue.group_id.nil? ? [] : Group.find(@issue.group_id).users, @issue.group_id.nil? ? [] : @issue.assigned_to), :include_blank => true, :required => @issue.required_attribute?('assigned_to_id') %><img id='btn_open_dialog_providers' src='/images/add.png' style='vertical-align: middle; margin-left: 3px; cursor: pointer; display: none;'>"                   