Deface::Override.new :virtual_path  => 'issues/show',
                     :name          => 'add_assigned_to_group_show',
                     :original		=> 'db01b75572817be9b76234bdeb3fae80e5ce64a9',
                     :replace       => "erb[loud]:contains(\"issue_fields_rows do |rows|\")",
                     :partial       => 'issues/partials/assigned_to_group_show'