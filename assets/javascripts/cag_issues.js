$(document).ready(function(){

	// En el caso en el que cambio el selector de 'Asignado a grupo' o el de 'Estado'.
	$(document).on('change', '#issue_group_id', '#issue_status_id', function() {
		// Id del grupo
   		group_id = $(this).val();
   		
   		// Petición para recibir los usuarios que pertenecen a ese grupo.
   		$.ajax({
			url: "/get_users_group",
			type: "GET",
			data: { group_id: group_id },
			success: function(response) { reloadAssignedTo(response); },
			error: function(xhr) { console.log(xhr); }
		});
	});

	function reloadAssignedTo(data){
		// Eliminamos los options del SELECT.
		$("#issue_assigned_to_id option").prop("selected", false);
		$("#issue_assigned_to_id option").remove();

		// Añadimos las opciones de usuarios que pertenecen al grupo.
		for(var i=0; i < data.users.length; i++){
			$("#issue_assigned_to_id").append("<option value="+data.users[i][1]+">"+data.users[i][0]+"</option>");
		}
	}

	// En el caso de que se modifica el estado de la petición.
	$(document).on('change', '#issue_status_id', function() {
		// Id del estado.
		status_id = $(this).val();

		// Petición para recibir el estado configurado para 'asignado a proveedor'.
		$.ajax({
			url: "/get_provider_status",
			type: "GET",
			success: function(response) { compareStatuses(response, status_id); },
			error: function(xhr) { console.log(xhr); }
		});
	});

	function compareStatuses(data, status_id){
		if(status_id == data.provider_status){
			// Recogemos los valores de los campos 'Expediente', 'Cód.Artículo' y 'Cód.Proveedor'.
			// y se muestran en el modal como valores por defecto.
			$("#prov_file").val($("#issue_custom_field_values_"+$setting_file_id).val());
			$("#prov_article").val($("#issue_custom_field_values_"+$setting_article_id).val());
			$("#prov_provider").val($("#issue_custom_field_values_"+$setting_provider_id).val());

			// Hacemos la busqueda de proveedores por defecto al abrir el modal por primera vez.	
			if(($("#issue_custom_field_values_"+$setting_file_id).val().length !== 0) || ($("#issue_custom_field_values_"+$setting_article_id).val().length !== 0) || ($("#issue_custom_field_values_"+$setting_provider_id).val().length !== 0)){
				getProvidersAjax();
			}

			// Se limpian el campo de 'Asignado a' antes de abrir el modal para evitar incoherencias si se cierra el modal.
			// Se asignada en el campo de 'Asignado a grupo' el valor de 'Servicio Técnico'
			$("#issue_group_id option").each(function(){
				if($(this).text() == "Servicio Técnico"){
					$(this).prop("selected", true);
				}
				else{
					// $(this).prop("disabled", true);
					$(this).remove();
				}
			});
			
			$("#issue_assigned_to_id option").prop("selected", false);
			$("#issue_assigned_to_id option").remove();

			// Abrimos el modal
			$("#dialog_providers").dialog("open");
		}
	}

	function getProvidersAjax(){
		// Recogemos los valores de Expediente/Cod.Artículo/Cod.Expediente.
		cod_file     = $("#prov_file", $("#btn_form_provider").parents("#dialog_providers")).val();
		cod_article  = $("#prov_article", $("#btn_form_provider").parents("#dialog_providers")).val();
		cod_provider = $("#prov_provider",$("#btn_form_provider").parents("#dialog_providers")).val();

		// Petición para obtener proveedores de la tabla gg_contacts.
   		$.ajax({
			url: "/get_providers",
			type: "GET",
			data: { cod_file: cod_file, cod_article: cod_article, cod_provider: cod_provider },
			success: function(response) { getProviders(response); },
			error: function(xhr) { console.log(xhr); }
		});
	}

	// Busqueda de los proveedores cuando se realiza la busqueda.
	$(document).on("click", "#btn_form_provider", function(){
		getProvidersAjax();
	});

	function getProviders(data){
		$content_providers = "";
		// Eliminamos el mensaje de error de si no hay contactos en el caso de que se encuentre.
		$(".contact_not_found").remove();
		// Para mostrar el texto donde indica el número de proveedores encontrados.
		$(".cursive_length").remove();
		$(".div_btn_provider").append("<i class='cursive_length'>Encontrado(s) "+ data.providers.length +" proveedor(es).</i>");
		
		// Contenedor donde se mostrara los resultados de proveedores obtenidos.
		$(".container_providers").remove();
		$content_providers += "<div class='container_providers'>\n";
		if(data.providers.length > 0 ){
			$content_providers += "<table class='list'>";
			$content_providers += "<thead><tr><th></th><th>Expediente</th><th>Cod.Artículo</th><th>Cod.Proveedor</th><th>Nombre Proveedor</th></tr></thead>";
			$content_providers += "<tbody>"

			for(var i=0; i<data.providers.length; i++){
				getCodeFile(data.providers[i].gg_article.id, i);
				$content_providers += "<tr>";
				$content_providers += "<td><input type='radio' name='provider_id' value='"+data.providers[i].gg_article.id+"'/></td>\n";	
				$content_providers += "<td class='tr_code_file_"+i+"'></td>";
				$content_providers += "<td>"+data.providers[i].gg_article.code_article+"</td>";
				$content_providers += "<td>"+data.providers[i].gg_article.code_provider+"</td>";
				$content_providers += "<td>"+data.providers[i].gg_article.name_provider+"</td>";
				$content_providers += "</tr>";
			}

			$content_providers += "</tbody>";
			$content_providers += "</table>";
		 	$content_providers += "<button type='submit' id='btn_container_providers' name='btn_providers'> Aceptar </button>";
		}
		$content_providers += "</div>\n";

		$(".hr_form_provider_last").after($content_providers);
	}

	function getCodeFile(id, i){
		// Petición para obtener el codigo del expediente.
   		$.ajax({
			url: "/get_code_file",
			type: "GET",
			data: { file_id: id },
			success: function(response) { $(".tr_code_file_"+i).append(response.code_file);	},
			error: function(xhr) { console.log(xhr); }
		});
	}

	$(document).on("click", "#btn_container_providers", function(){
		// Comprobación de que se haya seleccionado al uno de los proveedores indicados en la lista.
		if($("input[type='radio'][name='provider_id']:checked").val()){
			provider_id = $("input[type='radio'][name='provider_id']:checked").val();

			// Petición para obtener el contacto del proveedor.
	   		$.ajax({
				url: "/get_provider_contact",
				type: "GET",
				data: { provider_id: provider_id },
				success: function(response) { setSelectProvider(response.contact); },
				error: function(xhr) { console.log(xhr); }
			});
		} else {
			// Mostramos un mensaje de error indicando que debe seleccionar un proveedor.
			$(".container_providers").append("<i class='contact_not_found'>Debe seleccionar un proveedor.<i>");	
			// Desactivamos botón de aceptar.
			$("#btn_container_providers").attr("disabled", true)	
		}
	});

	function setSelectProvider(contact){
		if($.isEmptyObject(contact)){
			// Desactivamos botón de aceptar.
			$("#btn_container_providers").attr("disabled", true)
			// Eliminamos el mensaje de error de si no hay contactos en el caso de que se encuentre.
			$(".contact_not_found").remove();
			// Mostramos el mensaje de error indicando que no hay contactos de nivel 1 para ese proveedor.
			$(".container_providers").append("<i class='contact_not_found'>No existe ningún contacto de nivel 1 para ese proveedor.<i>")
		} else {
			// Activamos el botón de aceptar.
			$("#btn_container_providers").attr("disabled", false);

			// Añadimos el contacto encontrado cuando se ha seleccionado un proveedor.
			$("#issue_assigned_to_id").append("<option value="+contact.id+" selected>"+contact.firstname+" "+contact.lastname+"</option>");

			// Cerramos el dialog.
			$("#dialog_providers").dialog("destroy");
		}
	}

	// En el caso de que se modique la selección del listado de proveedores del modal.
	$(document).on("change", "input[type='radio'][name='provider_id']", function(){
		// Activamos botón de aceptar
		$("#btn_container_providers").attr("disabled", false)
		// Eliminamos el mensaje de error de si no hay contactos en el caso de que se encuentre.
		$(".contact_not_found").remove();
	});
	
});