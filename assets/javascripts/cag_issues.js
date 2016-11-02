$(document).ready(function(){

	// FUNCIONALIDAD PARA CUANDO UNA PETICIÓN PASA AL ESTADO 'ASIGNADO A PROVEEDOR'
	//-----------------------------------------------------------------------------

	// En el caso en el que cambio el selector de 'Asignado a grupo' o el de 'Estado'.
	$(document).on('change', '#issue_group_id', function() {
		// Id del grupo
   		group_id = $("#issue_group_id").val();
   		
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
		// Eliminar los options del select 'assigned_to'
		removeOptionsAssignedTo();

		// Añadimos las opciones de usuarios que pertenecen al grupo.
		for(var i=0; i < data.users.length; i++){
			$("#issue_assigned_to_id").append("<option value="+data.users[i][1]+">"+data.users[i][0]+"</option>");
		}
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
			$(".container_providers").append("<i class='contact_not_found'>Debe seleccionar un proveedor.</i>");	
			// Desactivamos botón de aceptar.
			$("#btn_container_providers").attr("disabled", true);	
		}
	});

	function setSelectProvider(contact){
		if($.isEmptyObject(contact)){
			// Desactivamos botón de aceptar.
			$("#btn_container_providers").attr("disabled", true)
			// Eliminamos el mensaje de error de si no hay contactos en el caso de que se encuentre.
			$(".contact_not_found").remove();
			// Mostramos el mensaje de error indicando que no hay contactos de nivel 1 para ese proveedor.
			$(".container_providers").append("<i class='contact_not_found'>No existe ningún contacto de nivel 1 para ese proveedor.</i>")
		} else {
			// Eliminar los options del select 'assigned_to'
			removeOptionsAssignedTo();

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
	
	// Si se hace click en el botón para volver a abrir el dialog de providers.
	$(document).on("click", "#btn_open_dialog_providers", function(){
		$("#dialog_providers").dialog("open");
	});

	// Eliminar los options del select 'assigned_to'
	function removeOptionsAssignedTo(){
		$("#issue_assigned_to_id option").prop("selected", false);
		$("#issue_assigned_to_id option").remove();
	}


	// FUNCIONALIDAD PARA CUANDO UNA PETICIÓN PASA AL ESTADO 'ANÁLISIS DE INFORMACIÓN'
	//--------------------------------------------------------------------------------
	
	// 1. BÚSQUEDA DEL ARTÍCULO EN ISE_MATERIAL_DISTRIBUIDO
	// ----------------------------------------------------

	// Abrir el modal para la busqueda del articulo.
	$(document).on("click", "[id = 'Detalles del Artículo - CSME']", function(){
		// Recogemos los valores de los campos 'Código de centro', 'Cód.Artículo', 'Tipo de artículo', 'Expediente', y 'Número de serie'.
		// y se muestran en el modal como valores por defecto.
		$("#article_cod_center").val($("#issue_custom_field_values_"+$setting_code_center).val());
		$("#article_cod_article").val($("#issue_custom_field_values_"+$setting_article_id).val());
		$("#article_type_article").val($("#issue_custom_field_values_"+$setting_article_type).val());
		$("#article_cod_file").val($("#issue_custom_field_values_"+$setting_file_id).val());
		$("#article_serial_number").val($("#issue_custom_field_values_"+$setting_serial_number).val());

		// Abrimos el modal
		$("#dialog_articles_csme").dialog("open");
	});

	// Busqueda de los articulos (ISE_MATERIAL_DISTRIBUIDO_GARANTIAS) cuando se realiza la busqueda.
	$(document).on("click", "#btn_form_article_csme", function(){
		cod_center    = $("#article_cod_center",$("#btn_form_article_csme").parents("#dialog_articles_csme")).val();
		cod_article   = $("#article_cod_article", $("#btn_form_article_csme").parents("#dialog_articles_csme")).val();
		type_article  = $("#article_type_article", $("#btn_form_article_csme").parents("#dialog_articles_csme")).val();
		cod_file      = $("#article_cod_file", $("#btn_form_article_csme").parents("#dialog_articles_csme")).val();
		cod_adj       = $("#article_cod_adj",$("#btn_form_article_csme").parents("#dialog_articles_csme")).val();
		serial_number = $("#article_serial_number",$("#btn_form_article_csme").parents("#dialog_articles_csme")).val();

		// Indicamos que se esta buscando los artículos.
		$(".cursive_length").remove();
		$(".div_btn_article").append("<i class='cursive_length'><img class='modal_loading_gif' src='/images/loading.gif' /> Por favor, espere un momento mientras se realiza la búsqueda.</i>");

		// Petición para obtener articulos de la table ISE_MATERIAL_DISTRIBUIDO_GARANTIAS.
   		$.ajax({
			url: "/get_articles_csme",
			type: "GET",
			data: { article_csme: { code_center: cod_center, code_article: cod_article, code_type_material: type_article, code_file: cod_file, adj: cod_adj, serial_number: serial_number} },
			success: function(response) { getArticlesCsme(response); },
			error: function(xhr) { console.log(xhr); }
		});
	});

	function getArticlesCsme(data){
		$content_articles = "";
		// Eliminamos el mensaje de error de si no hay artículos en el caso de que se encuentre.
		$(".article_not_found").remove();
		// // Para mostrar el texto donde indica el número de artículos encontrados.
		$(".cursive_length").remove();
		$(".div_btn_article").append("<i class='cursive_length'>Encontrado(s) "+ data.articles_csme.length +" articulo(s).</i>");
		
		// // Contenedor donde se mostrara los resultados de artículos obtenidos.
		$(".container_articles").remove();
		$content_articles += "<div class='container_articles'>\n";
		if(data.articles_csme.length > 0 ){
			$content_articles += "<table class='list'>";
			$content_articles += "<thead><tr><th></th><th>Artículo</th><th>Aparato</th><th>Proveedor</th><th>Número de serie</th><th>Fin de Garantía</th></tr></thead>";
			 	$content_articles += "<tbody>"
			 	dateToday = new Date();
			 	for(var i=0; i<data.articles_csme.length; i++){
		 			$content_articles += "<tr>";
			 		$content_articles += "<td><input type='radio' name='article_csme_id' value='"+data.articles_csme[i].gg_material.id+"'/></td>\n";
			 		$content_articles += "<td>"+data.articles_csme[i].gg_material.article+"</td>";

			 		if(data.articles_csme[i].gg_material.device == null){
			 			$content_articles += "<td><center>-</center></td>";
			 		}else{
			 			$content_articles += "<td>"+data.articles_csme[i].gg_material.device+"</td>";
			 		}

			 		$content_articles += "<td>"+data.articles_csme[i].gg_material.provider+"</td>";

			 		if(data.articles_csme[i].gg_material.serial_number == null){
			 			$content_articles += "<td><center>-</center></td>";
			 		}else{
			 			$content_articles += "<td>"+data.articles_csme[i].gg_material.serial_number+"</td>";
			 		}
			 		
			 		if(data.articles_csme[i].gg_material.date_guarantee == null ){
			 			$content_articles += "<td><center>-</center></td>";
			 		}else{
			 			article_guarantee = data.articles_csme[i].gg_material.date_guarantee;
		 				article_guarantee_date = new Date(article_guarantee.split("-")[0], article_guarantee.split("-")[1]-1,article_guarantee.split("-")[2]);

			 			if(dateToday > article_guarantee_date){
			 				$content_articles += "<td class='guarantee_end_out'>"+article_guarantee.split("-")[2]+"-"+(article_guarantee.split("-")[1])+"-"+article_guarantee.split("-")[0]+"</td>"
			 			}else{
			 				$content_articles += "<td>"+data.articles_csme[i].gg_material.date_guarantee+"</td>";
			 			}
			 		}

			 		$content_articles += "</tr>";
			 	}

			 	$content_articles += "</tbody>";
			$content_articles += "</table>";
			$content_articles += "<button type='submit' id='btn_container_articles_csme' name='btn_articles_csme'> Aceptar </button>";
		}
		$content_articles += "</div>\n";

		$(".hr_form_article_last").after($content_articles);
	}

	$(document).on("click", "#btn_container_articles_csme", function(){
		// Comprobación de que se haya seleccionado uno de los artículos mostrados en la lista.
		if($("input[type='radio'][name='article_csme_id']:checked").val()){
		 	article_csme_id = $("input[type='radio'][name='article_csme_id']:checked").val();

		 	// Petición para obtener el artículo.
	    		$.ajax({
		 		url: "/get_article_csme",
		 		type: "GET",
		 		data: { article_csme_id: article_csme_id },
		 		success: function(response) { setSelectArticle(response.article_csme); },
		 		error: function(xhr) { console.log(xhr); }
		 	});
		} else {
		 	// Mostramos un mensaje de error indicando que debe seleccionar un artículo.
		 	$(".container_articles").append("<i class='article_not_found'>Debe seleccionar un artículo.</i>");	
		 	// Desactivamos botón de aceptar.
		 	$("#btn_container_articles_csme").attr("disabled", true);	
		}
	});

	function setSelectArticle(article_csme){
		// Asignamos cada valor en cada campo personalizado de la agrupación 'Detalles del artículo - CSME'

		/* Código Art. (csme)    	  */ $("#issue_custom_field_values_"+$setting_article_id).val(article_csme.code_article);
		/* Nombre Art (csme)     	  */ $("#issue_custom_field_values_"+$setting_article_name).val(article_csme.article);
		/* Código Prov. (csme)   	  */ $("#issue_custom_field_values_"+$setting_provider_id).val(article_csme.code_provider);
		/* Nombre Prov. (csme)        */ $("#issue_custom_field_values_"+$setting_provider_name).val(article_csme.provider);
		/* Expediente (csme)          */ $("#issue_custom_field_values_"+$setting_file_id).val(article_csme.code_file);
		// /* Expediente Garantía (csme) */ $("#issue_custom_field_values_"+$setting_file_guarantee).val(article_csme.code_file);
		/* Tipo Art. (csme)      	  */ $("#issue_custom_field_values_"+$setting_article_type).val(article_csme.code_type_material);
		/* Nº Serie (csme)       	  */ $("#issue_custom_field_values_"+$setting_serial_number).val(article_csme.serial_number);
		/* Fecha Garantía (csme) 	  */ $("#issue_custom_field_values_"+$setting_date_guarantee).val(article_csme.date_guarantee);
		/* Lote (csme)                */ $("#issue_custom_field_values_"+$setting_lot).val(article_csme.lot);

		// Se comprueba el estado de garantía del artículo
		dateToday = new Date();
		article_guarantee = article_csme.date_guarantee;

		if(article_guarantee != null){
			article_guarantee = new Date(article_guarantee.split("-")[0], article_guarantee.split("-")[1]-1,article_guarantee.split("-")[2]);
			
			// Se selecciona el estado de garantía del artículo en el campo personalizado
			$("#issue_custom_field_values_"+$setting_guarantee_status+" option").each(function(){
				if((article_guarantee >= dateToday) && $(this).text() == "En garantía"){
					$(this).prop("selected", true);
				}

				if((article_guarantee < dateToday) && $(this).text() == "Fuera de garantía"){
					$(this).prop("selected", true);
				}
			});
		}else{
			$("#issue_custom_field_values_"+$setting_guarantee_status+" option").each(function(){
				if($(this).val() == ""){
					$(this).prop("selected", true);
				}
			});
		}

		// Se limpie el valor del campo personalizado 'Expediente Garantía (csme)' */
		$("#issue_custom_field_values_"+$setting_file_guarantee).val("");

		// Cerramos el dialog.
		$("#dialog_articles_csme").dialog("close");
	}

	// Añadir el botón por defecto en el caso de que el estado se encuentre previamente en 'Análisis de información CSMe'
	if($("#issue_status_id").val() == $id_issue_status){
		$("[id = 'Detalles del Artículo - CSME']").append("<img id='btn_open_dialog_articles' src='/images/edit.png' style='vertical-align: middle; margin-left: 5px; cursor: pointer; display: inline;'>");
		$("#issue_custom_field_values_"+$setting_file_guarantee).after("<img id='btn_open_dialog_files_services' src='/images/add.png' style='vertical-align: middle; margin-left: 5px; cursor: pointer; display: inline;'>");
	}

	// 2. BÚSQUEDA DEL EXPEDIENTE DE SERVICIO PARA LA NUEVA FECHA DE GARANTÍA
	// ----------------------------------------------------------------------

	$(document).on("click", "#btn_open_dialog_files_services", function(){
		// Abrimos el modal de expedientes que van a estar asociados al contrato de mantenimiento.
		// Recogemos los valores de los campos 'Expediente Garantía (csme)' y se muestran en el modal como valores por defecto.
		$("#service_code_file").val($("#issue_custom_field_values_"+$setting_file_guarantee).val());

		// Abrimos el modal
		$("#dialog_files_services_csme").dialog("open");
	});

	// Busqueda de los expedientes cuando se realiza la busqueda.
	$(document).on("click", "#btn_form_file_service_csme", function(){
		code_file = $("#service_code_file", $("#btn_form_file_service_csme").parents("#dialog_files_services_csme")).val();

		// Indicamos que se esta buscando los expedientes asociados.
		$(".cursive_length").remove();
		$(".div_btn_file_service").append("<i class='cursive_length'><img class='modal_loading_gif' src='/images/loading.gif' /> Por favor, espere un momento mientras se realiza la búsqueda.</i>");

		// Petición para obtener los expedientes.
   		$.ajax({
			url: "/get_files_services_csme",
			type: "GET",
			data: { code_file: code_file },
			success: function(response) { getFilesServicesCsme(response); },
			error: function(xhr) { console.log(xhr); }
		});
	});

	function getFilesServicesCsme(data){
		$content_files_services = "";
		// Eliminamos el mensaje de error de si no hay expedientes en el caso de que se encuentre.
		$(".article_not_found").remove();
		// // Para mostrar el texto donde indica el número de expedientes encontrados.
		$(".cursive_length").remove();
		$(".div_btn_file_service").append("<i class='cursive_length'>Encontrado(s) "+ data.files_services_csme.length +" expediente(s).</i>");
	
		// // Contenedor donde se mostrara los resultados de los expedientes obtenidos.
		$(".container_files_services").remove();
		$content_files_services += "<div class='container_files_services'>\n";
		if(data.files_services_csme.length > 0 ){
			$content_files_services += "<table class='list'>";
			$content_files_services += "<thead><tr><th></th><th>Código Expediente</th><th>Artículo</th><th>Fin de Garantía</th></tr></thead>";
			 	$content_files_services += "<tbody>"
			 	dateToday = new Date();

			 	for(var i=0; i<data.files_services_csme.length; i++){
			 		$content_files_services += "<tr>";
			 		$content_files_services += "<td><input type='radio' name='file_service_csme_id' value='"+data.files_services_csme[i].gg_files_service.id+"'/></td>\n";
			 		
			 		if(data.files_services_csme[i].gg_files_service.code_file_services == null){
						$content_files_services += "<td><center>-</center></td>";
			 		}else{
			 			$content_files_services += "<td>"+data.files_services_csme[i].gg_files_service.code_file_services+"</td>";
			 		}

			 		$content_files_services += "<td>"+data.files_services_csme[i].gg_files_service.name_article+"</td>";
			 		
			 		if(data.files_services_csme[i].gg_files_service.date_guarantee == null ){
			 			$content_files_services += "<td><center>-</center></td>";
			 		}else{
			 			article_guarantee = data.files_services_csme[i].gg_files_service.date_guarantee;
		 				article_guarantee = new Date(article_guarantee.split("-")[0], article_guarantee.split("-")[1]-1,article_guarantee.split("-")[2]);
			 			
			 			if(dateToday > article_guarantee){
			 				$content_files_services += "<td class='guarantee_end_out'>"+data.files_services_csme[i].gg_files_service.date_guarantee+"</td>"
			 			}else{
			 				$content_files_services += "<td>"+data.files_services_csme[i].gg_files_service.date_guarantee+"</td>";
			 			}
			 		}

			 		$content_files_services += "</tr>";
			 	}

			 	$content_files_services += "</tbody>";
			$content_files_services += "</table>";
			$content_files_services += "<button type='submit' id='btn_container_files_services_csme' name='btn_files_services_csme'> Aceptar </button>";
		}

		$content_files_services += "</div>\n";

		$(".hr_form_file_service_last").after($content_files_services);
	}

	$(document).on("click", "#btn_container_files_services_csme", function(){
		// Comprobación de que se haya seleccionado uno de los expedientes indicados en la lista.
		if($("input[type='radio'][name='file_service_csme_id']:checked").val()){
		 	file_service_csme_id = $("input[type='radio'][name='file_service_csme_id']:checked").val();

		 	// Petición para obtener el expediente.
	    		$.ajax({
		 		url: "/get_file_service_csme",
		 		type: "GET",
		 		data: { file_service_csme_id: file_service_csme_id },
		 		success: function(response) { setSelectFileService(response.files_services_csme); },
		 		error: function(xhr) { console.log(xhr); }
		 	});
		} else {
		 	// Mostramos un mensaje de error indicando que debe seleccionar un expediente.
		 	$(".container_files_services").append("<i class='file_service_not_found'>Debe seleccionar un expediente.</i>");	
		 	// Desactivamos botón de aceptar.
		 	$("#btn_container_files_services_csme").attr("disabled", true);	
		}
	});

	function setSelectFileService(file_service_csme){
		// Asignamos el nuevo valor del 'Expediente Garantía (csme)'
		$("#issue_custom_field_values_"+$setting_date_guarantee).val(file_service_csme.date_guarantee);
		
		// Asignamos el nuevo valor de 'Fecha Garantía (csme)'
		$("#issue_custom_field_values_"+$setting_file_guarantee).val(file_service_csme.code_file_services);

		// Se comprueba el estado de garantía del artículo
		dateToday = new Date();
		article_guarantee = file_service_csme.date_guarantee;
		
		if(article_guarantee != null){
			article_guarantee = new Date(article_guarantee.split("-")[0], article_guarantee.split("-")[1]-1,article_guarantee.split("-")[2]);

			// Se selecciona el estado de garantía del artículo en el campo personalizado
			$("#issue_custom_field_values_"+$setting_guarantee_status+" option").each(function(){
				if((article_guarantee >= dateToday) && $(this).text() == "En mantenimiento"){
					$(this).prop("selected", true);
				}

				if((article_guarantee < dateToday) && $(this).text() == "Fuera de garantía"){
					$(this).prop("selected", true);
				}
			});
		}else{
			$("#issue_custom_field_values_"+$setting_guarantee_status+" option").each(function(){
				if($(this).val() == ""){
					$(this).prop("selected", true);
				}
			});
		}
		
		// Cerramos el modal
		$("#dialog_files_services_csme").dialog("close");
	}
});