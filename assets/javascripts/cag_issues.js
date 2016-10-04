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

	// En el caso de que se modifica el estado de la petición.
	// $(document).on('change', '#issue_status_id', function() {
	// 	// Id del estado.
	// 	status_id = $(this).val();

	// 	// Petición para recibir el estado configurado para 'asignado a proveedor'.
	// 	$.ajax({
	// 		url: "/get_status",
	// 		type: "GET",
	// 		success: function(response) { compareStatuses(response, status_id); },
	// 		error: function(xhr) { console.log(xhr); }
	// 	});
	// });

	// function compareStatuses(data, status_id){
	// 	// Eliminar los options del select 'assigned_to'
	// 	removeOptionsAssignedTo();

	// 	if(status_id == data.provider_status){
	// 		// Recogemos los valores de los campos 'Expediente', 'Cód.Artículo' y 'Cód.Proveedor'.
	// 		// y se muestran en el modal como valores por defecto.
	// 		$("#prov_file").val($("#issue_custom_field_values_"+$setting_file_id).val());
	// 		$("#prov_article").val($("#issue_custom_field_values_"+$setting_article_id).val());
	// 		$("#prov_provider").val($("#issue_custom_field_values_"+$setting_provider_id).val());

	// 		// Hacemos la busqueda de proveedores por defecto al abrir el modal por primera vez.	
	// 		if(($("#issue_custom_field_values_"+$setting_file_id).val().length !== 0) || ($("#issue_custom_field_values_"+$setting_article_id).val().length !== 0) || ($("#issue_custom_field_values_"+$setting_provider_id).val().length !== 0)){
	// 			getProvidersAjax();
	// 		}

	// 		// Se asignada en el campo de 'Asignado a grupo' el valor de 'Servicio Técnico'
	// 		$("#issue_group_id option").each(function(){
	// 			if($(this).text() == "Servicio Técnico"){
	// 				$(this).prop("selected", true);
	// 			}
	// 			else{
	// 				// $(this).prop("disabled", true);
	// 				$(this).remove();
	// 			}
	// 		});

	// 		// Abrimos el modal
	// 		$("#dialog_providers").dialog("open");

	// 		// Se muestra el botón por si se cierra el modal y se desea volver a abrir.
	// 		$("#btn_open_dialog_providers").css("display","inline");
	// 	}

	// 	/*
	// 	if(status_id == data.analysis_status){
	// 		$("[id = 'Detalles del Artículo - CSME']").append("<img id='btn_open_dialog_articles' src='/images/edit.png' style='vertical-align: middle; margin-left: 5px; cursor: pointer; display: inline;'>");
	// 	}
	// 	*/
	// }

	// function getProvidersAjax(){
	// 	// Recogemos los valores de Expediente/Cod.Artículo/Cod.Expediente.
	// 	cod_file     = $("#prov_file", $("#btn_form_provider").parents("#dialog_providers")).val();
	// 	cod_article  = $("#prov_article", $("#btn_form_provider").parents("#dialog_providers")).val();
	// 	cod_provider = $("#prov_provider",$("#btn_form_provider").parents("#dialog_providers")).val();

	// 	// Petición para obtener proveedores de la tabla gg_contacts.
 //   		$.ajax({
	// 		url: "/get_providers",
	// 		type: "GET",
	// 		data: { cod_file: cod_file, cod_article: cod_article, cod_provider: cod_provider },
	// 		success: function(response) { getProviders(response); },
	// 		error: function(xhr) { console.log(xhr); }
	// 	});
	// }

	// // Busqueda de los proveedores cuando se realiza la busqueda.
	// $(document).on("click", "#btn_form_provider", function(){
	// 	getProvidersAjax();
	// });

	// function getProviders(data){
	// 	$content_providers = "";
	// 	// Eliminamos el mensaje de error de si no hay contactos en el caso de que se encuentre.
	// 	$(".contact_not_found").remove();
	// 	// Para mostrar el texto donde indica el número de proveedores encontrados.
	// 	$(".cursive_length").remove();
	// 	$(".div_btn_provider").append("<i class='cursive_length'>Encontrado(s) "+ data.providers.length +" proveedor(es).</i>");
		
	// 	// Contenedor donde se mostrara los resultados de proveedores obtenidos.
	// 	$(".container_providers").remove();
	// 	$content_providers += "<div class='container_providers'>\n";
	// 	if(data.providers.length > 0 ){
	// 		$content_providers += "<table class='list'>";
	// 		$content_providers += "<thead><tr><th></th><th>Expediente</th><th>Cod.Artículo</th><th>Fecha Garantía</th><th>Cod.Proveedor</th><th>Nombre Proveedor</th></tr></thead>";
	// 		$content_providers += "<tbody>"

	// 		for(var i=0; i<data.providers.length; i++){
	// 			getCodeFile(data.providers[i].gg_article.id, i);

	// 			$content_providers += "<tr>";
	// 			$content_providers += "<td><input type='radio' name='provider_id' value='"+data.providers[i].gg_article.id+"'/></td>\n";	
	// 			$content_providers += "<td class='tr_code_file_"+i+"'></td>";
	// 			$content_providers += "<td>"+data.providers[i].gg_article.code_article+"</td>";

	// 			if(data.providers[i].gg_article.guarantee_end == null){
	// 				$content_providers += "<td><center>-<center></td>"
	// 			}else{
	// 		 		gg_article_guarantee = data.providers[i].gg_article.guarantee_end;
	// 		 		gg_article_guarantee = new Date(gg_article_guarantee.split("-")[0], gg_article_guarantee.split("-")[1]-1,gg_article_guarantee.split("-")[2])
	// 	 			if(dateToday > gg_article_guarantee){
	// 					$content_providers += "<td class='guarantee_end_out'>"+data.providers[i].gg_article.guarantee_end+"</td>";
	// 				}else{
	// 					$content_providers += "<td>"+data.providers[i].gg_article.guarantee_end+"</td>";
	// 				}
	// 			}

	// 			$content_providers += "<td>"+data.providers[i].gg_article.code_provider+"</td>";
	// 			$content_providers += "<td>"+data.providers[i].gg_article.name_provider+"</td>";
	// 			$content_providers += "</tr>";
	// 		}

	// 		$content_providers += "</tbody>";
	// 		$content_providers += "</table>";
	// 	 	$content_providers += "<button type='submit' id='btn_container_providers' name='btn_providers'> Aceptar </button>";
	// 	}
	// 	$content_providers += "</div>\n";

	// 	$(".hr_form_provider_last").after($content_providers);
	// }

	// function getCodeFile(id, i){
	// 	// Petición para obtener el codigo del expediente.
 //   		$.ajax({
	// 		url: "/get_code_file",
	// 		type: "GET",
	// 		data: { file_id: id },
	// 		success: function(response) { $(".tr_code_file_"+i).append(response.code_file);	},
	// 		error: function(xhr) { console.log(xhr); }
	// 	});
	// }

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
		// Eliminamos el mensaje de error de si no hay contactos en el caso de que se encuentre.
		$(".article_not_found").remove();
		// // Para mostrar el texto donde indica el número de proveedores encontrados.
		$(".cursive_length").remove();
		$(".div_btn_article").append("<i class='cursive_length'>Encontrado(s) "+ data.articles_csme.length +" articulo(s).</i>");
		
		// // Contenedor donde se mostrara los resultados de proveedores obtenidos.
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
		 				article_guarantee = new Date(article_guarantee.split("-")[0], article_guarantee.split("-")[1]-1,article_guarantee.split("-")[2]);
			 			
			 			if(dateToday > article_guarantee){
			 				$content_articles += "<td class='guarantee_end_out'>"+data.articles_csme[i].gg_material.date_guarantee+"</td>"
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
		// Comprobación de que se haya seleccionado al uno de los proveedores indicados en la lista.
		if($("input[type='radio'][name='article_csme_id']:checked").val()){
		 	article_csme_id = $("input[type='radio'][name='article_csme_id']:checked").val();

		 	// Petición para obtener el contacto del proveedor.
	    		$.ajax({
		 		url: "/get_article_csme",
		 		type: "GET",
		 		data: { article_csme_id: article_csme_id },
		 		success: function(response) { setSelectArticle(response.article_csme); },
		 		error: function(xhr) { console.log(xhr); }
		 	});
		} else {
		 	// Mostramos un mensaje de error indicando que debe seleccionar un proveedor.
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
		/* Expediente Garantía (csme) */ $("#issue_custom_field_values_"+$setting_file_guarantee).val(article_csme.code_file);
		/* Tipo Art. (csme)      	  */ $("#issue_custom_field_values_"+$setting_article_type).val(article_csme.code_type_material);
		/* Nº Serie (csme)       	  */ $("#issue_custom_field_values_"+$setting_serial_number).val(article_csme.serial_number);
		/* Fecha Garantía (csme) 	  */ $("#issue_custom_field_values_"+$setting_date_guarantee).val(article_csme.date_guarantee);
		/* Lote (csme)                */ $("#issue_custom_field_values_"+$setting_lot).val(article_csme.lot);

		// Cerramos el dialog.
		$("#dialog_articles_csme").dialog("close");
	}

	// Añadir el botón por defecto en el caso de que el estado se encuentre previamente en 'Análisis de información CSMe'
	if($("#issue_status_id").val() == $id_issue_status){
		$("[id = 'Detalles del Artículo - CSME']").append("<img id='btn_open_dialog_articles' src='/images/edit.png' style='vertical-align: middle; margin-left: 5px; cursor: pointer; display: inline;'>");
	}
});