var recv_event_page = 1;
var recv_event_pages = 1;
var send_cmd_page = 1;
var send_cmd_pages = 1;

function getDeviceDetails(device_id) {
	var data = {}
	$("#sub_nav").css("display", 'none');

	data["client_id"] = device_id;
	$.ajax({
		url: "/bwiot/api/v1/device/details/",
		type: "GET",
		data: data,
		async: false,
		success: function (data) {
			if (data["status"] == "Success") {
				console.log(data,"water")
				var device_status = { 0: "<span class='badge badge-danger'>Inactive</span>", 1: "<span class='badge badge-danger'>Inactive</span>", 2: "<span class='badge badge-success'>Active</span>" };
				$("#single-device-id").html(data["device_details"]["device"]);
				$("#single-device-status").html(device_status[data["device_details"]["connect_status"]]);
				$("#single-device-name_").html(data["device_details"]["device_name"]);
				$("#single-device-name").html(data["device_details"]["device"]);
				$("#single-device-ip").html(data["device_details"]["ip"]);
				var d = dateString(data["device_details"]["time"]);
				d = d.split("G")[0]
				// console.log(d)
				$("#single-device-time").html(d);






				getSubscribeTopics(data["device_details"]["device"])
				getActiveSubscribeTopics(data["device_details"]["device"])
				getDevicePublishedMsg(data["device_details"]["device"])
				getDeviceReceivedMsg(data["device_details"]["device"])
				getDeviceAcl(data["device_details"]["device"])
				if (data["will_details"] == '') {
					$("#single-device-topic").html("-");
					$("#single-device-qos").html("-");
					$("#single-device-message").html("-");
				}
				else {
					$("#single-device-topic").html(data["will_details"]["will_topic"]);
					$("#single-device-qos").html(data["will_details"]["will_QoS"]);
					$("#single-device-message").html(data["will_details"]["will_message"]);
				}
			}
		}
	})
}


/*function getDeviceActiveTopics() {
	data = {};
	data["offset"] = 0;
	data["status"] = "all";
	data["search"] = "";
	$.ajax({
		url : "/bwiot/device/list/",
		type : "GET",
		data : data,
		success : function(data) {
			if(data["status"] == "Success") {
				var html = "";
				var device_status = {0 : "<span class='badge badge-danger'>Inactive</span>", 1 : "<span class='badge badge-danger'>Inactive</span>", 2 : "<span class='badge badge-success'>Active</span>"};
				for(var i = 0; i < data["devices"].length; i++) {
					html += "<tr style='cursor: pointer;' onclick=setSingleDevice('" + data["devices"][i]["device"] +"') ><td>"+ data["devices"][i]["device"] +"</td><td>"+ device_status[data["devices"][i]["connect_status"]] +"</td><td>"+ data["devices"][i]["ip"] +"</td><td>"+ new Date(data["devices"][i]["time"]).toString().slice(0, 25) +"</td></tr>"
				}
				$("#device-list").html(html);
			}
		}
	})
}*/

function getSubscribeTopics() {
	var data = {};
	data["device_id"] = $("#single-device-id").text();
	$.ajax({
		url: "/bwiot/api/v1/device/subscribe_topic/",
		type: "GET",
		data: data,
		success: function (data) {
			if (data["status"] == "Success") {
				var html = "";
				for (i in data["active_subscription"]) {
					html += "<option>" + data["active_subscription"][i]["topic"] + "</option>"
				}
				$("#client-sub-topic-selector").html(html);
			}
		}
	})
}

function getActiveSubscribeTopics() {
	data = {};
	data["device_id"] = $("#single-device-id").text();
	$.ajax({
		url: "/bwiot/api/v1/device/subscribe_topic/",
		type: "GET",
		data: data,
		success: function (data) {
			if (data["status"] == "Success") {
				recv_event_pages = data["pages"];
				var html = "";
				for (var i = 0; i < data["active_subscription"].length; i++) {
					html += "<tr><td data-th='Topic : '><p>" + data["active_subscription"][i]["topic"] + "</p></td><td data-th='QoS : '><p>" + data["active_subscription"][i]["QoS"] + "</p></td></tr>"
				}
				$("#active-subscription").html(html);
			}
		}
	})
}


function getDevicePublishedMsg(device_id) {
	data = {};
	data["page"] = recv_event_page;
	data["device_id"] = device_id;
	$.ajax({
		url: "/bwiot/api/v1/device/published_messages/",
		type: "GET",
		data: data,
		success: function (data) {
			if (data["status"] == "Success") {
				recv_event_pages = data["pages"];
				var html = "";
				for (var i = 0; i < data["received_messages"].length; i++) {
					html += "<tr><td data-th='Topic : '><p>" + data["received_messages"][i]["topic"] + "</p></td><td data-th='QoS : '><p>" + data["received_messages"][i]["qos"] + "</p></td><td data-th='Message : '><p>" + data["received_messages"][i]["message"] + "</p></td><td data-th='Time : '><p>" + dateString(data["received_messages"][i]["time"]) + "</p></td></tr>"
				}
				$("#single-device-publish").html(html);
			}
		}
	})
}


function getDeviceReceivedMsg(device_id) {
	data = {};
	data["page"] = send_cmd_page;
	data["device_id"] = device_id;
	$.ajax({
		url: "/bwiot/api/v1/device/subscried_messages/",
		type: "GET",
		data: data,
		success: function (data) {
			if (data["status"] == "Success") {
				send_cmd_pages = data["pages"];
				var html = "";
				for (var i = 0; i < data["sent_messages"].length; i++) {
					html += "<tr><td data-th='Topic : '><p>" + data["sent_messages"][i]["topic"] + "</p></td><td data-th='QoS : '><p>" + data["sent_messages"][i]["qos"] + "</p></td><td data-th='Message : '><p>" + data["sent_messages"][i]["message"] + "</p></td><td data-th='Time : '><p>" + dateString(data["sent_messages"][i]["time"]) + "</p></td></tr>"
				}
				$("#single-device-sent").html(html);
			}
		}
	})
}

function changeRecvEventPage(n) {
	if (recv_event_page + n <= recv_event_pages && recv_event_page + n > 0) {
		recv_event_page = recv_event_page + n
		getDevicePublishedMsg($("#single-device-id").text());
	}
}

function changeSendCmdPage(n) {
	if (send_cmd_page + n <= send_cmd_pages && send_cmd_page + n > 0) {
		send_cmd_page = send_cmd_page + n;
		getDeviceReceivedMsg($("#single-device-id").text());
	}
}

function sendCommand() {
	var data = {};
	data["device_id"] = $("#single-device-id").text();
	data["topic"] = $("#client-sub-topic-selector").val();
	data["message"] = $("#client-send-message").val();
	$.ajax({
		url: "/bwiot/api/v1/device/send_command/",
		type: "POST",
		data: data,
		success: function (data) {
			if (data["status"] == "Success") {
				$("#dashboard-sent-msg-count").text(parseInt($("#dashboard-sent-msg-count").text()) + 1);
				$(".device-send-success").text("Message sent to " + $("#single-device-id").text());
				$("#client-send-message").val("");
				setTimeout(function () {
					$(".device-send-success").text("");
				}, 3000);
			}
			else {
				$(".device-send-fail").text("Failed");
				setTimeout(function () {
					$(".device-send-fail").text("");
				}, 3000);
			}
		}
	});
}

function sendAcl() {
	var data = {};
	data["device_id"] = $("#single-device-id").text();
	data["publish_topics"] = $("#publish-topic").val();
	data["subscribe_topics"] = $("#subscribe-topic").val();
	data["publish_access"] = $("#pub_access").is(":checked") ? "allow" : "deny";
	data["subscribe_access"] = $("#sub_acess").is(":checked") ? "allow" : "deny";
	console.log(data,"data-acl")
	$.ajax({
		url: "/bwiot/api/v1/topic_acl",
		type: "POST",
		data: data,
		success: function (data) {
			console.log(data, "srk")
			if (data["status"] == "Success") {
				// $("#dashboard-sent-msg-count").text(parseInt($("#dashboard-sent-msg-count").text()) + 1);
				// $(".device-send-success").text("Message sent to " + $("#single-device-id").text());
				// $("#client-send-message").val("");
				setTimeout(function () {
					$(".device-send-success").text("");
				}, 3000);
			}
			else {
				$(".device-send-fail").text("Failed");
				setTimeout(function () {
					$(".device-send-fail").text("");
				}, 3000);
			}
		}
	});
}

function getDeviceAcl(device_id) {
	$.ajax({
		url: "/bwiot/api/v1/topic_acl",
		type: "GET",
		data: {"username": device_id},
		success: function (data) {
			if (data["status"] == "Success") {
				console.log(data,"actl-get");
				$("#publish-topic").val(data["acl"]["publish_topics"]);
				$("#subscribe-topic").val(data["acl"]["subscribe_topics"]);
			}
			else{
				alert("data[status}==failed")
			}
		}
	})
}


function deviceDataRender(type, device, topic, msg, time, qos) {
	switch (type) {
		case "recv_pub":
			if (recv_event_page > 1) break;
			for (; $("#single-device-publish tr").length > 12;) {
				$('#single-device-publish tr:last').remove();
			}
			$("#single-device-publish").prepend("<tr><td data-th='Topic : '><p>" + topic + "</p></td><td data-th='Message : '><p>" + qos + "</p></td><td data-th='Message : '><p>" + msg + "</p></td><td data-th='Time : '><p>" + time + "</p></td><tr>");
			break;
		case "send":
			if (send_cmd_page > 1) break;
			for (; $("#single-device-sent tr").length > 12;) {
				$('#single-device-sent tr:last').remove();
			}
			$("#single-device-sent").prepend("<tr><td data-th='Topic : '><p>" + topic + "</p></td><td data-th='QoS : '><p>" + qos + "</p></td><td data-th='Message : '><p>" + msg + "</p></td><td data-th='Time : '><p>" + time + "</p></td><tr>");
			break;
		case "connect":
			$("#single-device-status").html("<span class='badge badge-success'>Active</span>");
			break;
		case "disconnect":
			$("#single-device-status").html("<span class='badge badge-danger'>Inactive</span>");
			break;
	}
}


function getdevicename() {
	down = $("#single-device-name_").text();
	$("#single-device-name_text").val(down);
	$("#save_new_device_name").css("display", '');
	$("#single-device-name_text ").css("display", '');
	$("#single-device-name_").css("display", 'none');
	$("#device_edit").css("display", "none")
}
function closedevicename() {

	data = {}
	device_name = $("#single-device-name_text").val();
	client_name = $("#single-device-name").text();
	data["name"] = device_name
	data["c_name"] = client_name
	/*var textvalue = $("#single-device-name_text").val();
	if(textvalue == "")
	{
	   
		$("#single-device-name_text").attr("style", "block");
	}*/
	$.ajax({
		url: "/bwiot/api/v1/device/update_dname/",
		type: "POST",
		data: data,
		success: function (data) {
			$("#client-send-message").val("");
			//alert(data)
		}
	})
	$("#single-device-name_").text(device_name);
	$("#save_new_device_name").css("display", 'none');
	$("#single-device-name_text ").css("display", 'none');
	$("#single-device-name_").css("display", '');
	$("#device_edit").css("display", "")

}

$(".nav-item").click(function () {
	$("#single-device-name_text").hide();
	$("#save_new_device_name").hide();
	$("#single-device-name_").show();
	$("#device_edit").show();
});