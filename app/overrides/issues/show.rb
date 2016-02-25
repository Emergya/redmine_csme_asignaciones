Deface::Override.new :virtual_path  => 'issues/show',
                     :name          => 'add_assigned_to_group_show',
                     :original		=> '23afbd4cd0659d8ad1ceb024250d7ac289623fa4',
                     :replace       => "erb[loud]:contains(\"issue_fields_rows do |rows|\")",
                     :partial       => 'issues/partials/assigned_to_group_show'