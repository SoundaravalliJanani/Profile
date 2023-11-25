var device_status = "act"
var device_count = 0;
var device_search = "";

function getCookie(cname) {
	var name = cname + "=";
	var decodedCookie = decodeURIComponent(document.cookie);
	var ca = decodedCookie.split(';');
	for (var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length);
		}
	}
	return "";
}

$(document).ready(function () {

	$(".dashboard-navbar").click(function () {
		$(".dashboard-navbar").removeClass("dashboard-navbar-active");
		$(this).addClass("dashboard-navbar-active");
	});

	getlogincheck();
	$(".page").hide();
	if (window.location.hash == "") {
		$(".page-dashboard").show();
		navbarHighlighter("page-dashboard")
		getDashboard();
		$("#second-navbar").show();
		$(".dashboard-navbar").removeClass("dashboard-navbar-active");
		$("#mqtt-navbar").addClass("dashboard-navbar-active");
	}
	else {
		var hashurl = (window.location.hash).split("#")
		var dashboard_id = hashurl[1].split("/");
		if (hashurl[1] == "") {

			$(".dashboard-navbar").removeClass("dashboard-navbar-active");
			$("#mqtt-navbar").addClass("dashboard-navbar-active");
			$(".page-dashboard").show();

			navbarHighlighter("page-dashboard")
			getDashboard();
		}
		else if (dashboard_id[0] == "page-widget") {
			$(".dashboard-navbar").removeClass("dashboard-navbar-active");
			$("#dashboard-id-" + dashboard_id[1]).addClass("dashboard-navbar-active");


			$("." + dashboard_id[0]).show();
			$("#second-navbar").show();
			pageSwitcher(dashboard_id[0]);
			getMobileDash(dashboard_id[1]);
			$("[data-target='#widget-modal']").show();
		}
		else {
			$("#second-navbar").hide();
			$("." + hashurl[1]).show();
			pageSwitcher(hashurl[1]);
		}
	}
});
$(window).on("hashchange", function () {
	$("[data-target='#widget-modal']").hide();
	$(".page").hide();
	if (window.location.hash == "") {
		$(".dashboard-navbar").removeClass("dashboard-navbar-active");
		$("#mqtt-navbar").addClass("dashboard-navbar-active");
		$(".page-dashboard").show();
		getDashboard();
		$("#second-navbar").show();
		navbarHighlighter("page-dashboard")
	}
	else {
		$(".page").hide();
		var hashurl = (window.location.hash).split("#");
		var dashboard_id = hashurl[1].split("/");
		if (hashurl[1] == "") {
			$(".dashboard-navbar").removeClass("dashboard-navbar-active");
			$("#mqtt-navbar").addClass("dashboard-navbar-active");
			$(".page-dashboard").show();
			getDashboard();
			$("#second-navbar").show();
			navbarHighlighter("page-dashboard")
		}
		else if (dashboard_id[0] == "page-widget") {
			$("." + dashboard_id[0]).show();
			pageSwitcher(dashboard_id[0]);
			$("#second-navbar").show();


			$("[data-target='#widget-modal']").show();
			//getWidgets(dashboard_id[1]);
		}
		else {
			$("#second-navbar").hide();
			$("." + hashurl[1]).show();
			pageSwitcher(hashurl[1]);
		}
	}
});



function getMobileDash(id) {

	$.ajax({
		url: "/bwiot/api/v1/dashboard/",
		type: "GET",
		success: function (result) {
			if (result["status"] == "Success") {
				var result = result.dashboards;
				var dashname = "";
				for (i in result) {
					if (id == result[i].id) {
						dashname = result[i].name;
					}
				}
				getWidgets(id, dashname);
			}
		}
	});

}

function plan_check() {
	$.ajax({
		url: "/bwiot/api/v1/mqttdashboard/",
		type: "GET",
		success: function (data) {

			//console.log("function calls",data['plan_type']);
			if (data['plan_type'] == 0 || data['plan_type'] == 1) {
				$("#second-navbar").hide();
				$(".page-dashboard").hide();
				$(".page-plan-update").show();
				//$("#dashboard-modal").modal('hide');

			}
			else {
				$("#dashboard-modal").modal('show');
			}
		}
	});

}


function pageSwitcher(page) {

	/*if(page) {
		$("." + page).addClass("active-nav");
	}
	else {
		$(".page-dashboard").addClass("active-nav");
	}*/
	navbarHighlighter(page)
	switch (page) {
		case "page-device":
			getDeviceList();
			break;
		case "page-topic":
			offsetSetter(0, 1);
			getTopicMessageCount();
			break;
		case "page-rule":
			getRules();
			break;
		case "page-security":
			getSecurityDetails();
			break;
		case "page-single-device":
			$(".page-device-nav").addClass("active-navbar");
			var single_device_id = getCookie("single_device_id")
			getDeviceDetails(single_device_id);
			getSubscribeTopics();
			/*getDevicePublishedMsg(single_device_id);
			getDeviceReceivedMsg(single_device_id);*/
			break;
		case "page-error-log":
			getErrorLog();
			break;
		case "page-tour":
			gettour();
			break;
		case "page-client":
			getpage();
			break;
		case "page-topic1":
			gettopic1();
			break;
		default:
			$(".page-dashboard-nav").addClass("active-navbar");
			getDashboard();
			break;
	}
}

function gettopic1() {
	$("#topic1_page").css("display", "block");
	$.ajax({
		url: "/bwiot/api/v1/mqttdashboard/",
		type: "GET",
		success: function (data) {
			if (data["status"] == "Success") {
				var html = "";
				if (data["plan_type"] == 0 || data["plan_type"] == 1) {
					$("#topic1_page").css("display", "none");
					$(".page-plan-update").show();
				}
				else {
					// console.log(data["published_topics"]);
					if (data["published_topics"].length == 0) {
						$("#nodata-pub-act-topic").show();
					}
					else {
						$("#nodata-pub-act-topic").remove();
						for (var i = 0; i < data["published_topics"].length; i++) {
							html += "<tr><td data-th='Topic Name : '>" + data["published_topics"][i]["topic"] + "</td><td data-th='Client Id : '>" + data["published_topics"][i]["client"] + "</td><td data-th='Published Message : '>" + data["published_topics"][i]["pub_message"] + "</td><td data-th='Published Time : '>" + dateString(data["published_topics"][i]["pub_time"]) + "</td></tr>"
						}
						$("#pub-act-topic").html(html);
					}
					html = "";
					// console.log(data["subscription_topics"]);
					if (data["subscription_topics"].length == 0) {
						$("#nodata-sub-act-topic").show();
					}
					else {
						$("#nodata-sub-act-topic").remove();
						for (var i = data["subscription_topics"].length - 1; i >= 0; i--) {
							html += "<tr><td data-th='Topic : '>" + data["subscription_topics"][i]["topic"] + "</td><td data-th='Device ID : '>" + data["subscription_topics"][i]["device"] + "</td><td data-th='Qos : '>" + data["subscription_topics"][i]["QoS"] + "</td></tr>"
						}
						$("#sub-act-topic").html(html);
					}
				}
			}
		}
	});
}

function navbarHighlighter(page) {
	$(".nav-item").removeClass("active-navbar");
	if (page) {
		$("." + page + "-nav").addClass("active-navbar");

	}
	else {
		$(".page-dashboard-nav").addClass("active-navbar");
	}
}

function getDashboard() {

	$.ajax({
		url: "/bwiot/api/v1/mqttdashboard/",
		type: "GET",
		success: function (data) {
			if (data["status"] == "Success") {
				$("#dashboard-active-device-count").html(data["connected_device_count"]);
				//$("#dashboard-inactive-device-count").html(data["disconnected_device_count"]);
				$("#dashboard-total-device-count").html(data["total_device_count"]);
				//$("#dashboard-active-topic-count").html(data["active_topic_count"]);
				$("#dashboard-pub-msg-count").html(data["received_message_count"]);
				$("#dashboard-sent-msg-count").html(data["sent_message_count"]);
				var html = "";
				if (data["received_messages"].length == 0) {
					$("#nodata-recv-msg").show();
				}
				else {
					$("#nodata-recv-msg").remove();
				}
				for (var i = 0; i < data["received_messages"].length; i++) {
					html += "<tr><td data-th='Device ID : '><p>" + data["received_messages"][i]["device"] + "</p></td><td data-th='Topic : '><p>" + data["received_messages"][i]["topic"] + "</p></td><td data-th='Message : '><p>" + data["received_messages"][i]["message"] + "</p></td><td data-th='Time : '><p>" + dateString(data["received_messages"][i]["time"]) + "</p></td></tr>"
				}
				$("#dashboard-recv-msg").html(html);
				var html = "";
				if (data["error_log"].length == 0) {
					$("#nodata-error-log").show();
				}
				else {
					$("#nodata-error-log").remove();
				}
				for (var i = 0; i < data["error_log"].length; i++) {
					html += "<tr><td data-th='Device ID : '><p>" + data["error_log"][i]["device"] + "</p></td><td data-th='IP : '><p>" + data["error_log"][i]["ip"] + "</p></td><td data-th='Status : '><p>" + data["error_log"][i]["detail"] + "</p></td><td data-th='Time : '><p>" + dateString(data["error_log"][i]["time"]) + "</p></td></tr>"
				}
				$("#dashboard-error-log").html(html);
				var html = "";
				if (data["connected_devices"].length == 0) {
					$("#nodata-con-device").show();
				}
				else {
					$("#nodata-con-device").remove();
				}
				for (var i = 0; i < data["connected_devices"].length; i++) {
					html += "<tr><td data-th='Device ID : '><p>" + data["connected_devices"][i]["device"] + "</p></td><td data-th='IP : '><p>" + data["connected_devices"][i]["ip"] + "</p></td><td data-th='Time : '><p>" + dateString(data["connected_devices"][i]["time"]) + "</p></td></tr>"
				}
				$("#dashboard-con-device").html(html);
				var html = "";
				if (data["disconnected_devices"].length == 0) {
					$("#nodata-discon-device").show();
				}
				else {
					$("#nodata-discon-device").remove();
				}
				for (var i = 0; i < data["disconnected_devices"].length; i++) {
					html += "<tr><td data-th='Device ID : '><p>" + data["disconnected_devices"][i]["device"] + "</p></td><td data-th='IP : '><p>" + data["disconnected_devices"][i]["ip"] + "</p></td><td data-th='Time : '><p>" + dateString(data["disconnected_devices"][i]["time"]) + "</p></td></tr>"
				}
				$("#dashboard-discon-device").html(html);
				if (data["plan_type"] == 0) {
					$("#trial").show();
				}
				//if remote authentication enabled/disabled security page.
				//alert(data["security"])
				if (data["security"] == "YES") {
					$("#securitylink").hide();
				}
			}
		}
	});
}

$("#sub_nav").css("display", "block");
$("#second-navbar").css("display", "block");

$(".nav-single").hover(function () {
	$(".nav-single").css("color", "black");
	$(this).css("color", "blue");
	$(".active").css("color", "blue");
})

$(".nav-single").mouseout(function () {
	if ($(this).hasClass("active")) {
		$(this).css("color", "blue");
	}
	else {
		$(this).css("color", "black");
	}
});

$("#navbtn").click(function () {
	$("#trial").toggle();
});

function getSecurityDetails() {
	$("#sub_nav").css("display", 'none');
	$.ajax({
		// url: '/bwiot/api/v1/auth/',
		url: '/bwiot/api/v1/topic_acl',
		type: "GET",
		data: { "username": "*" },
		async: true,
		success: function (result) {
			if (result["status"] == "Success") {
				console.log(result, "results")
				$(".security-tr").remove();
				var html = "";
				for (var i = 0; i < result["acl"].length; i++) {
					// html += "<tr class='security-tr'><td>"+result["acl"][i]["username"]+"</td><td>"+result["acl"][i]["password"]+"</td><td>"+result["acl"][i]["access_type"]+"</td><td><i style=cursor:pointer class='fa fa-times text-danger' onclick='deleteAuth("+result["acl"][i]["id"]+")'></i></td></tr>";
					var publishAccess = result["acl"][i]["publish_access"] === "allow" ? "checked" : "";
					var subscribeAccess = result["acl"][i]["subscribe_access"] === "allow" ? "checked" : "";

					html += `<tr id="div-${result["acl"][i]["username"]}" class="security-tr">
					<td class="td-align2 iconSwitch" style="width:60px;font-size:24px;cursor:pointer;">
						<i class="fa fa-caret-right" aria-hidden="true"></i>
						<i class="fa fa-caret-down d-none" aria-hidden="true"></i>
					</td>
					<td class="tableNew__cell">
						<div class="col-10 p-0">
							<label>Auth Key</label>
							<input type="text" name="auth_key" class="form-control"
								placeholder="Auth key" value="${result["acl"][i]["username"]}" required=""
								autocomplete="off" disabled>
						</div>
					</td>
					<td class="tableNew__cell">
						<div class="col-10 p-0">
							<label>Auth Token</label>
							<input type="text" name="auth_token"
								class="form-control" placeholder="Auth token" value="${result["acl"][i]["password"]}"
								required="" autocomplete="off" disabled>
						</div>
					</td>
					<td class="tableNew__cell td-align2">
						<i style="cursor:pointer" class="fa fa-trash text-danger del-icon" onclick="deleteAuth(${result["acl"][i]["id"]})"></i>
					</td>
				</tr>
				<tr class="div-${result["acl"][i]["username"]} security-tr d-none">
					<td class="tableNew__cell b-top-0"></td>
					<td class="tableNew__cell b-top-0">
						<div class="my-3 row align-items-center">
							<div class="col-10">
								<label>Publish Topics</label>
								<input type="text" name="update_key"
									class="form-control" placeholder="Enter publish topic" required=""
									autocomplete="off" value="${result["acl"][i]["publish_topics"]}">
									<small><i>One or more <b>comma separated</b> topic names of messages sent by this device.</i>
									</small>
							</div>
							<div class="col-2">
								<label>Allow/Deny</label>
								<input class="tgl tgl-light" id="pub-${i}" name="update_pubAcc" type="checkbox" ${publishAccess} />
								<label class="tgl-btn" for="pub-${i}"></label>
							</div>
						</div>
					</td>
					<td class="b-top-0">
						<div class="my-3 row align-items-center">
							<div class="col-10">
								<label>Subscribe Topics</label>
								<input type="text" name="update_token"
									class="form-control" placeholder="Enter subscribe topic" required=""
									autocomplete="off" value="${result["acl"][i]["subscribe_topics"]}">
									<small><i>One or more <b>comma separated</b> topic names of messages sent by this device.</i>
									</small>
							</div>
							<div class="col-2">
								<label>Allow/Deny</label>
								<input class="tgl tgl-light" id="sub-${i}" name="update_subAcc" type="checkbox" ${subscribeAccess} />
								<label class="tgl-btn" for="sub-${i}"></label>
							</div>
						</div>
					</td>
					<td class="b-top-0 td-align">
						<div>
							<button type="submit" class="btn btn-success" onclick="updateAcl('${result["acl"][i]["username"]}')"><i class="fa fa-check"></i></button>&nbsp;&nbsp;
							<button type="button" class="btn btn-danger" onclick="closeDropdown('${result["acl"][i]["username"]}')"><i class="fa fa-times"></i></button>
						</div>
					</td>
				</tr>`
				}


			}
			$("#security-table").append(html);
			openDropdown();
		},
		error: function () { }
	});
}

function openDropdown() {
	$(".iconSwitch").click(function () {
		clsName = $(this).parent().attr("id");
		$(this).find(".fa-caret-right").toggleClass("d-none");
		$(this).find(".fa-caret-down").toggleClass("d-none");
		$("." + clsName).toggleClass("d-none");
	});
}

function closeDropdown(getDivId) {
	$("#div-"+getDivId).find(".fa-caret-right").toggleClass("d-none");
	$("#div-"+getDivId).find(".fa-caret-down").toggleClass("d-none");
	$(".div-" + getDivId).toggleClass("d-none");
}
function updateAcl(getDivClass) {
	var data = {};
	data["username"] = getDivClass;
	data["publish_topics"]= $(".div-"+getDivClass).find("[name='update_key']").val();
	data["subscribe_topics"]= $(".div-"+getDivClass).find("[name='update_token']").val();

	data["publish_access"] = $(".div-"+getDivClass).find("[name='update_pubAcc']").is(':checked') ? 'allow' : 'deny';
	data["subscribe_access"] = $(".div-"+getDivClass).find("[name='update_subAcc']").is(':checked') ? 'allow' : 'deny';
	console.log(data,"siva")
	$.ajax({
		url: "/bwiot/api/v1/auth/topic_acl",
		type: "POST",
		data: data,
		async: true,
		success: function (result) {
			if (result["status"] == "Success") {
				getSecurityDetails();
			}
			else {
				alert(result["status"]);
			}
		},
		error: function () {
			alert("Request Faild try after some times");
		}
	});
}

function deleteAuth(id) {
	$.ajax({
		url: "/bwiot/api/v1/auth/delete/",
		type: "POST",
		data: { "auth_id": id },
		async: true,
		success: function (result) {
			if (result["status"] == "Success") {
				getSecurityDetails();
			}
			else {
				alert(result["status"]);
			}
		},
		error: function () {
			alert("Request Faild try after some times");
		}
	});
}

function addSecurityDetail() {
	var data = {};
	var authData = {};
	var data = $("#security-table-form").serializeArray().reduce(function (obj, item) {
		obj[item.name] = item.value;
		return obj;
	}, {});

	data["username"] = data["auth_key"];

	data["publish_access"] = $('#publish_toggle').is(':checked') ? 'allow' : 'deny';
	data["subscribe_access"] = $('#subscribe_toggle').is(':checked') ? 'allow' : 'deny';
	console.log(data, "checking");
	authData["auth_key"] = data["auth_key"];
	authData["auth_token"] = data["auth_token"];
	console.log(authData)
	$.ajax({
		url: "/bwiot/api/v1/auth/",
		type: "POST",
		"data": authData,
		dataType: "text",
		async: false,
		success: function (result) {
			var result = JSON.parse(result);
			console.log(result, "auth")
			if (result["status"] == "Success") {
				// $("input").val("");
				// getSecurityDetails();
				// $("#security-table tr").first("tr").hide();
				// // location.reload();
			}
			else {
				//   $('#rt-modal-text').html('Please upgrade your plan!');
				//   $('#rt-modal').modal('show');
			}
		}
	});
	$.ajax({
		url: "/bwiot/api/v1/topic_acl",
		type: "POST",
		"data": data,
		dataType: "text",
		async: false,
		success: function (result) {
			var result = JSON.parse(result);

			console.log(result, "topic-acl")
			if (result["status"] == "Success") {
				$("input").val("");
				getSecurityDetails();
				$("#security-table tr").first("tr").hide();
				// location.reload();
			}
			else {
				$('#rt-modal-text').html('Please upgrade your plan!');
				$('#rt-modal').modal('show');
			}
		}
	});
}

function fun() {
	var date = new Date().toString().slice(0, 25);
	$(".clock").html(date);
	setTimeout(function () {
		fun();
	}, 1000);
}

fun();

function dashboardRealTimeDataRender(type, device, topic, msg, time) {
	switch (type) {
		case "recv_pub":
			$("#dashboard-pub-msg-count").text(parseInt($("#dashboard-pub-msg-count").text()) + 1);
			$("#nodata-recv-msg").remove();
			for (; $("#dashboard-recv-msg tr").length > 7;) {
				$('#dashboard-recv-msg tr:last').remove();
			}
			$("#dashboard-recv-msg").prepend("<tr><td>" + device + "</td><td>" + topic + "</td><td>" + msg + "</td><td>" + time + "</td><tr>");
			break;
		case "send":
			$("#dashboard-sent-msg-count").text(parseInt($("#dashboard-sent-msg-count").text()) + 1);
			break;
		case "errorlog":
			$("#nodata-error-log").remove();
			for (; $("#dashboard-error-log tr").length > 7;) {
				$('#dashboard-error-log tr:last').remove();
			}
			$("#dashboard-error-log").prepend("<tr><td>" + device + "</td><td>" + topic + "</td><td>" + msg + "</td><td>" + time + "</td><tr>")
			break;
		case "connect":
			if (parseInt($("#dashboard-total-device-count").text()) > parseInt($("#dashboard-active-device-count").text())) {
				$("#dashboard-active-device-count").text(parseInt($("#dashboard-active-device-count").text()) + 1);
			}
			else {
				$("#dashboard-total-device-count").text(parseInt($("#dashboard-total-device-count").text()) + 1);
				$("#dashboard-active-device-count").text(parseInt($("#dashboard-active-device-count").text()) + 1);
			}
			$("#dashboard-discon-device td:contains('" + device + "')").next().text(function () {
				return $(this).parent().remove();
			});
			$("#nodata-con-device").remove();
			for (; $("#dashboard-con-device tr").length > 7;) {
				$('#dashboard-con-device tr:last').remove();
			}
			$("#dashboard-con-device").prepend("<tr><td>" + device + "</td><td>" + topic + "</td><td>" + time + "</td><tr>");
			break;
		case "disconnect":
			if (parseInt($("#dashboard-active-device-count").text()) - 1 >= 0) {
				$("#dashboard-active-device-count").text(parseInt($("#dashboard-active-device-count").text()) - 1);
			}
			$("#dashboard-con-device td:contains('" + device + "')").next().text(function () {
				return $(this).parent().remove();
			});
			$("#nodata-discon-device").remove();
			for (; $("#dashboard-discon-device tr").length > 7;) {
				$('#dashboard-discon-device tr:last').remove();
			}
			$("#dashboard-discon-device").prepend("<tr><td>" + device + "</td><td>" + topic + "</td><td>" + time + "</td><tr>");
			break;
	}
}

function updatepubsubtopic(type, device, topic, msg, time, qos) {
	switch (type) {
		case "recv_pub":
			$("#nodata-pub-act-topic").remove();
			flag = 0
			$('#pub-act-topic tr').each(function (i, el) {
				var value1 = $(el).children().eq(0).text();
				var value2 = $(el).children().eq(1).text();
				var msg1 = $(el).children().eq(2).text();
				var tme1 = $(el).children().eq(3).text();
				if (value1 == topic && value2 == device) {
					flag = (flag) + 1;
					$(this).children(":eq(2)").text(msg);
					$(this).children(":eq(3)").text(time);
				}
			})
			if (flag == 0) {
				$("#pub-act-topic").prepend("<tr><td data-th='Topic Name : '>" + topic + "</td><td data-th='Client Id : '>" + device + "</td><td data-th='Published Message : '>" + msg + "</td><td data-th='Published Time : '>" + time + "</td></tr>");
			}
			break;
		case "onsubscribe":
			$("#nodata-sub-act-topic").remove();
			flag = 0
			$('#sub-act-topic tr').each(function (i, el) {
				var value1 = $(el).children().eq(0).text();
				var value2 = $(el).children().eq(1).text();
				var value3 = $(el).children().eq(2).text();
				if (value1 == topic && value2 == device && value3 == qos) {
					flag = (flag) + 1;
					$(this).closest('tr').insertBefore($('#sub-act-topic tr').eq(0));
				}
			})
			if (flag == 0) {
				$("#sub-act-topic").prepend("<tr><td data-th='Topic : '>" + topic + "</td><td data-th='Device ID : '>" + device + "</td><td data-th='Qos : '>" + qos + "</td></tr>");
			}
			break
		case "disconnect":
			$.ajax({
				url: "/bwiot/api/v1/mqttdashboard/",
				type: "GET",
				success: function (data) {
					if (data["status"] == "Success") {
						var html = "";
						if (data["subscription_topics"].length == 0) {
							$("#nodata-sub-act-topic").show();
						}
						else {
							$("#nodata-sub-act-topic").remove();
							for (var i = data["subscription_topics"].length - 1; i >= 0; i--) {
								html += "<tr><td data-th='Topic : '>" + data["subscription_topics"][i]["topic"] + "</td><td data-th='Device ID : '>" + data["subscription_topics"][i]["device"] + "</td><td data-th='Qos : '>" + data["subscription_topics"][i]["QoS"] + "</td></tr>"
							}
							$("#sub-act-topic").html(html);
						}
					}
				}
			});
			break;
	}
}

function getreset() {
	$('#password-modal').modal('show');
}
function changePassword() {
	// $('#password-modal').removeAttr('style','display:block');

	$('#password-modal').modal("hide");

	data = {}
	data["oldpassword"] = $("#oldpassword").val();
	data["newpassword"] = $("#newpassword").val();
	$.ajax({
		url: "/api/save/password",
		type: "POST",
		"data": data,
		dataType: "text",
		async: false,
		success: function (result) {
			alert(result);
			//getuserdetails();
		}
	});
}
/*function getdash()
{
	$(".page-tour").hide()
	$(".page-dashboard").show();
			getDashboard();
		$("#second-navbar").show();
	

}*/
function gettour() {
	$("#step0").css("display", "block");

}
function getpage() {
	$("#client-page").css("display", "block");

}
function getlogincheck() {
	$.ajax({
		url: "/bwiot/api/v1/login_check/",
		type: "GET",
		success: function (result) {
			if (result["WEB_LOGIN"]) {
				$("#user-login-settings").show();
			}
			else {
				$("#user-login-settings").hide();
			}
		}
	})
}

$(document).ready(function () {
	$.ajax({
		url: "/bwiot/api/v1/auth_check/",
		type: "GET",
		success: function (result) {
			if (result["authentication"]) {
				$("#securitylink").show();
			}
			else {
				$("#securitylink").hide();
			}
		}
	})
});
