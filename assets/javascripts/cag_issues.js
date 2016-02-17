$(document).ready(function(){

	$(document).on('change', '#issue_group_id', function() {
		// Id del grupo
   		group_id = $(this).val();
   		
   		// Peticion para recibir los usuarios que pertenecen a ese grupo
   		$.ajax({
			url: "/get_users_group",
			type: "GET",
			data: { group_id: group_id },
			success: function(response) { reloadAssignedTo(response); },
			error: function(xhr) { console.log(xhr); }
		});
	});

	function reloadAssignedTo(data){
		// Eliminamos los options del SELECT
		$("#issue_assigned_to_id").find('option').remove();

		// Añadimos las opciones de usuarios que pertenecen al grupo
		for(var i=0; i < data.users.length; i++){
			$("#issue_assigned_to_id").append("<option value="+data.users[i][1]+">"+data.users[i][0]+"</option>");
		}
	}

});