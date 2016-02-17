class AddAssignedGroupToIssue < ActiveRecord::Migration
  def self.up
  	add_column :issues, :group_id, :integer
  end

  def self.down
    remove_column :issues, :group_id
  end
end
