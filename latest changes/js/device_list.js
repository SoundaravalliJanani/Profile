var deviceListPage = 1;
var deviceListPages = 1;
var device_status = "all;"
var current_device_id = null;

function getDeviceList() {
	$("#sub_nav").css("display",'none');
	data = {};
	data["page"] = deviceListPage;
	var element = document.getElementsByName("device_list_status");
	for(i = 0; i < element.length; i++) {
		if(element[i].checked) {
			data["status"] = element[i].value;
			device_status = data["status"];
		}
    } 
	//data["status"] = "all";
	data["search"] = $("#device_search").val();
	// console.log(data);
	$.ajax({
		url : "/bwiot/api/v1/device/list/",
		type : "GET",
		data : data,
		success : function(data) {
			if(data["status"] == "Success") {
				deviceListPages = data["page"];
				var html = "";
				var device_status = {0 : "<span class='badge badge-danger'>Inactive</span>", 1 : "<span class='badge badge-danger'>Inactive</span>", 2 : "<span class='badge badge-success'>Active</span>"};
				for(var i = 0; i < data["devices"].length; i++) {
					// console.log(data["devices"][i]["connect_status"],"connect status",data["devices"][i]["clean_session"],"Clean clean_session")
					var cleanbutn = ""
					if (data["devices"][i]["connect_status"]!=2 && data["devices"][i]["clean_session"]==0){
						cleanbutn = "<button type='button' class='btn btn-info' onclick=cleanmsgqueue('" + data["devices"][i]["client_id"] +"')>Clean</button>";
					}else{
						cleanbutn = "<button type='button' disabled class='btn btn-default'>Clean</button>";
					}
					html += `
							<tr>
								<td style="cursor: pointer;" onclick="setSingleDevice('${data["devices"][i]["client_id"]}')">${data["devices"][i]["device"]}</td>
								<td style="cursor: pointer;" onclick="setSingleDevice('${data["devices"][i]["client_id"]}')">${data["devices"][i]["client_id"]}</td>
								<td style="cursor: pointer;" onclick="setSingleDevice('${data["devices"][i]["client_id"]}')">${device_status[data["devices"][i]["connect_status"]]}</td>
								<td style="cursor: pointer;" onclick="setSingleDevice('${data["devices"][i]["client_id"]}')">${data["devices"][i]["ip"]}</td>
								<td style="cursor: pointer;" onclick="setSingleDevice('${data["devices"][i]["client_id"]}')">${dateString(data["devices"][i]["time"])}</td>
								<td>${cleanbutn}</td>
							</tr>
							`;
				}
				$("#device-list").html(html);
			}
		}
	})
}

function cleanmsgqueue(client_id){
// console.log(client_id);
data["id"] = client_id;
	$.ajax({
		url : "/bwiot/api/v1/clean_message_queue/",
		type : "POST",
		data : data,
		success : function(data) {
			// console.log("hi");
		}
	})
return
}

$("#device_search").keyup(function() {
	deviceListPage = 1
	getDeviceList();
})

$("[name='device_list_status']").click(function() {
	deviceListPage = 1
	getDeviceList();
})

function changeDeviceListPage(n) {
	if(deviceListPage + n <= deviceListPages && deviceListPage + n >= 1) {
		deviceListPage = deviceListPage + n;
		getDeviceList()
	}
}

function setSingleDevicePage(th, page) {
	$(".nav-single").removeClass("active");
	$(th).addClass("active");
	$(".s-d-p").hide();
	$("." + page).show();

	switch(page) {
		case "sent-cmd" :
			getSubscribeTopics();
			break;
		case "sub-topic" :
			getActiveSubscribeTopics();
			break;
		case "pub-msg" :
			getDevicePublishedMsg($("#single-device-id").text());
			break;
		case "recv-msg" :
			getDeviceReceivedMsg($("#single-device-id").text());
			break;
		case "send-acl" :
			getDeviceAcl($("#single-device-id").text());
			break;
	}
}

function setSingleDevice(device_id) {
	document.cookie= "single_device_id=" + device_id
	current_device_id = device_id;
	window.location.href = "#page-single-device";
}


function deviceListDataRender(type, device, topic, message, time, cleansession) {
	var cleanbutn = ""
	if (cleansession==0)
	{
		if(type=="disconnect")
		{
			cleanbutn = "<button type='button' class='btn btn-info' onclick=cleanmsgqueue('" + device +"')>Clean</button>";
		}
		else
		{
			cleanbutn = "<button type='button' disabled class='btn btn-default'>Clean</button>";
		}
	}
	else
	{

		cleanbutn = "<button type='button' disabled class='btn btn-default'>Clean</button>";
	}
	switch(device_status) {
		case "all" :
			if(type == "connect") {
				$("#device-list td:contains('"+device+"')").text(function(){
					return $(this).parent().remove();
				});
				// for(;$("#device-list tr").length > 12;) {
				// 	$('#device-list tr:last').remove();
				// }
				// console.log(cleansession)
				$("#device-list").prepend("<tr><td style='cursor: pointer;' onclick=setSingleDevice('" + device +"')>"+ device +"</td><td style='cursor: pointer;' onclick=setSingleDevice('"+ device +"')>"+ device +"</td><td style='cursor: pointer;' onclick=setSingleDevice('" + device +"')><span class='badge badge-success'>Active</span></td><td style='cursor: pointer;' onclick=setSingleDevice('" + device +"')>"+ topic +"</td><td style='cursor: pointer;' onclick=setSingleDevice('" + device +"')>"+ time + "</td><td>"+cleanbutn+"</td></tr>");
			}
			else if(type == "disconnect") {
				$("#device-list td:contains('"+device+"')").text(function(){
					return $(this).parent().remove();
				});
				// for(;$("#device-list tr").length > 12;) {
				// 	$('#device-list tr:last').remove();
				// }
				$("#device-list").prepend("<tr><td style='cursor: pointer;' onclick=setSingleDevice('" + device +"')>"+ device +"</td><td style='cursor: pointer;' onclick=setSingleDevice('"+ device +"')>"+ device +"</td><td style='cursor: pointer;' onclick=setSingleDevice('" + device +"')><span class='badge badge-danger'>Inactive</span></td><td style='cursor: pointer;' onclick=setSingleDevice('" + device +"')>"+ topic +"</td><td style='cursor: pointer;' onclick=setSingleDevice('" + device +"')>"+ time + "</td><td>"+cleanbutn+"</td></tr>");
			}
			break;
		case "act" :
			if(type == "connect") {
				$("#device-list td:contains('"+device+"')").text(function(){
					return $(this).parent().remove();
				});
				// for(;$("#device-list tr").length > 12;) {
				// 	$('#device-list tr:last').remove();
				// }
				$("#device-list").prepend("<tr><td style='cursor: pointer;' onclick=setSingleDevice('" + device +"')>"+ device +"</td><td style='cursor: pointer;' onclick=setSingleDevice('"+ device +"')>"+ device +"</td><td style='cursor: pointer;' onclick=setSingleDevice('" + device +"')><span class='badge badge-success'>Active</span></td><td style='cursor: pointer;' onclick=setSingleDevice('" + device +"')>"+ topic +"</td><td style='cursor: pointer;' onclick=setSingleDevice('" + device +"')>"+ time + "</td><td>"+cleanbutn+"</td></tr>");
			}
			else if(type == "disconnect") {
				$("#device-list td:contains('"+device+"')").text(function(){
					return $(this).parent().remove();
				});
			}
			break;
		case "inact" :
			if(type == "connect") {
				$("#device-list td:contains('"+device+"')").text(function(){
					return $(this).parent().remove();
				});
			}
			else if(type == "disconnect") {
				$("#device-list td:contains('"+device+"')").text(function(){
					return $(this).parent().remove();
				});
				// for(;$("#device-list tr").length > 12;) {
				// 	$('#device-list tr:last').remove();
				// }
				$("#device-list").prepend("<tr><td style='cursor: pointer;' onclick=setSingleDevice('" + device +"')>"+ device +"</td><td style='cursor: pointer;' onclick=setSingleDevice('"+ device +"')>"+ device +"</td><td style='cursor: pointer;' onclick=setSingleDevice('" + device +"')><span class='badge badge-danger'>Inactive</span></td><td style='cursor: pointer;' onclick=setSingleDevice('" + device +"')>"+ topic +"</td><td style='cursor: pointer;' onclick=setSingleDevice('" + device +"')>"+ time + "</td><td>"+cleanbutn+"</td></tr>");
			}
			break;
	}
}
