Deface::Override.new :virtual_path  => 'issues/_attributes',
                     :name          => 'add_assigned_to_group_edit',
                     :original		=> 'fcca283a4a13bf49f03ef4ac43e87fdab8181adf',
                     :insert_before => "erb[silent]:contains(\"if @issue.safe_attribute? 'assigned_to_id'\")",
                     :partial       => 'issues/partials/assigned_to_group_edit'