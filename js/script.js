var users = [{
    id: 1,
    name: "Jon Smith",
    address: "3344 William Street, Omaha, NE  68130",
    age: 27
  },
  {
    id: 2,
    name: "Sam Gross",
    address: "6894 Dodge Street, Omaha, NE  68112",
    age: 32
  }
];

$.each(users, function (i, user) {
  appendToUsrTable(user);
});

$("form").submit(function (e) {
  e.preventDefault();
});

$("form#addUser").submit(function () {
  var user = {};
  var nameInput = $('input[name="name"]').val().trim();
  var addressInput = $('input[name="address"]').val().trim();
  var ageInput = $('input[name="age"]').val().trim();
  if (nameInput && addressInput && ageInput) {
    $(this).serializeArray().map(function (data) {
      user[data.name] = data.value;
    });
    var lastUser = users[Object.keys(users).sort().pop()];
    user.id = lastUser.id + 1;

    addUser(user);
  } else {
    alert("All fields must have a valid value.");
  }
});

function addUser(user) {
  users.push(user);
  appendToUsrTable(user);
}

function editUser(id) {
  users.forEach(function (user, i) {
    if (user.id == id) {
      $(".modal-body").empty().append(`
                <form id="updateUser" action="">
                    <label for="name">Name</label>
                    <input class="form-control" type="text" name="name" value="${user.name}"/>
                    <label for="address">Address</label>
                    <input class="form-control" type="text" name="address" value="${user.address}"/>
                    <label for="age">Age</label>
                    <input class="form-control" type="number" name="age" value="${user.age}" min=10 max=100/>
            `);
      $(".modal-footer").empty().append(`
                    <button type="button" type="submit" class="btn btn-primary" onClick="updateUser(${id})">Save changes</button>
                    <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                </form>
            `);
    }
  });
}

function deleteUser(id) {
  var action = confirm("Are you sure you want to delete this user?");

  users.forEach(function (user, i) {
    if (user.id == id && action != false) {
      users.splice(i, 1);
      $("#userTable #user-" + user.id).remove();
      flashMessage(msg);
    }
  });
}

function updateUser(id) {
var action = confirm("Are you sure you want to edit this user?");
  var user = {};
  user.id = id;
  users.forEach(function (user, i) {
    if (user.id == id) {
      $("#updateUser").children("input").each(function () {
        var value = $(this).val();
        var attr = $(this).attr("name");
        if (attr == "name") {
          user.name = value;
        } else if (attr == "address") {
          user.address = value;
        } else if (attr == "age") {
          user.age = value;
        }
      });
      users.splice(i, 1);
      users.splice(user.id - 1, 0, user);
      $("#userTable #user-" + user.id).children(".userData").each(function () {
        var attr = $(this).attr("name");
        if (attr == "name") {
          $(this).text(user.name);
        } else if (attr == "address") {
          $(this).text(user.address);
        } else {
          $(this).text(user.age);
        }
      });
      $(".modal").modal("toggle");
      flashMessage(msg);
    }
  });
}

function flashMessage(msg) {
  $(".flashMsg").remove();
  $(".row").prepend(`
        <div class="col-sm-12"><div class="flashMsg alert alert-success alert-dismissible fade in" role="alert"> <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">×</span></button> <strong>${msg}</strong></div></div>
    `);
}

function appendToUsrTable(user) {
  $("#userTable > tbody:last-child").append(`
        <tr id="user-${user.id}">
            <td class="userData" name="name">${user.name}</td>
            '<td class="userData" name="address">${user.address}</td>
            '<td id="tdAge" class="userData" name="age">${user.age}</td>
            '<td align="center">
                <button class="btn btn-primary btn-sm" form-control" onClick="editUser(${user.id})" data-toggle="modal" data-target="#myModal")">EDIT</button>
            </td>
            <td align="center">
                <button class="btn btn-primary btn-sm" form-control" onClick="deleteUser(${user.id})">DELETE</button>
            </td>
        </tr>
    `);
}


"use strict";

var params = null;
var colsEdi = null;
var newColHtml = '<div class="btn-group pull-right">' +
  '<button id="bEdit" type="button" class="btn btn-sm btn-default" onclick="rowEdit(this);">' +
  '<span class="glyphicon glyphicon-pencil" > </span>' +
  '</button>' +
  '<button id="bElim" type="button" class="btn btn-sm btn-default" onclick="rowElim(this);">' +
  '<span class="glyphicon glyphicon-trash" > </span>' +
  '</button>' +
  '<button id="bAcep" type="button" class="btn btn-sm btn-default" style="display:none;" onclick="rowAcep(this);">' +
  '<span class="glyphicon glyphicon-ok" > </span>' +
  '</button>' +
  '<button id="bCanc" type="button" class="btn btn-sm btn-default" style="display:none;" onclick="rowCancel(this);">' +
  '<span class="glyphicon glyphicon-remove" > </span>' +
  '</button>' +
  '</div>';
var colEdicHtml = '<td name="buttons">' + newColHtml + '</td>';

$.fn.SetEditable = function (options) {
  var defaults = {
    columnsEd: null, //Index to editable columns. If null all td editables. Ex.: "1,2,3,4,5"
    $addButton: null, //Jquery object of "Add" button
    onEdit: function () {}, //Called after edition
    onBeforeDelete: function () {}, //Called before deletion
    onDelete: function () {}, //Called after deletion
    onAdd: function () {} //Called when added a new row
  };
  params = $.extend(defaults, options);
  this.find('thead tr').append('<td name="buttons"><span class="glyphicon glyphicon-hospital"></span></td>');

  this.find('tbody tr').append(colEdicHtml);
  var $tabedi = this; //Read reference to the current table, to resolve "this" here.
  //Process "addButton" parameter
  if (params.$addButton != null) {

    params.$addButton.click(function () {
      rowAddNew($tabedi.attr("id"));
    });
  }
  //Process "columnsEd" parameter
  if (params.columnsEd != null) {
    //Extract felds
    colsEdi = params.columnsEd.split(',');
  }
};

function IterarCamposEdit($cols, tarea) {

  var n = 0;
  $cols.each(function () {
    n++;
    if ($(this).attr('name') == 'buttons') return;
    if (!EsEditable(n - 1)) return;
    tarea($(this));
  });

  function EsEditable(idx) {

    if (colsEdi == null) {
      return true;
    } else {

      for (var i = 0; i < colsEdi.length; i++) {
        if (idx == colsEdi[i]) return true;
      }
      return false;
    }
  }
}

function FijModoNormal(but) {
  $(but).parent().find('#bAcep').hide();
  $(but).parent().find('#bCanc').hide();
  $(but).parent().find('#bEdit').show();
  $(but).parent().find('#bElim').show();
  var $row = $(but).parents('tr');
  $row.attr('id', '');
}

function FijModoEdit(but) {
  $(but).parent().find('#bAcep').show();
  $(but).parent().find('#bCanc').show();
  $(but).parent().find('#bEdit').hide();
  $(but).parent().find('#bElim').hide();
  var $row = $(but).parents('tr');
  $row.attr('id', 'editing');
}

function ModoEdicion($row) {
  if ($row.attr('id') == 'editing') {
    return true;
  } else {
    return false;
  }
}

function rowAcep(but) {

  var $row = $(but).parents('tr');
  var $cols = $row.find('td');
  if (!ModoEdicion($row)) return;
  IterarCamposEdit($cols, function ($td) {
    var cont = $td.find('input').val();
    $td.html(cont);
  });
  FijModoNormal(but);
  params.onEdit($row);
}

function rowCancel(but) {

  var $row = $(but).parents('tr');
  var $cols = $row.find('td');
  if (!ModoEdicion($row)) return;
  IterarCamposEdit($cols, function ($td) {
    var cont = $td.find('div').html(); //
    $td.html(cont);
  });
  FijModoNormal(but);
}

function rowEdit(but) {
  var $row = $(but).parents('tr');
  var $cols = $row.find('td');
  if (ModoEdicion($row)) return;
  IterarCamposEdit($cols, function ($td) {
    var cont = $td.html();
    var div = '<div style="display: none;">' + cont + '</div>';
    var input = '<input class="form-control input-sm"  value="' + cont + '">';
    $td.html(div + input);
  });
  FijModoEdit(but);
}

function rowElim(but) {
  var $row = $(but).parents('tr');
  params.onBeforeDelete($row);
  $row.remove();
  params.onDelete();
}

function rowAddNew(tabId) {
  var $tab_en_edic = $("#" + tabId);
  var $filas = $tab_en_edic.find('tbody tr');
  if ($filas.length == 0) {

    var $row = $tab_en_edic.find('thead tr');
    var $cols = $row.find('th');
    var htmlDat = '';
    $cols.each(function () {
      if ($(this).attr('name') == 'buttons') {

        htmlDat = htmlDat + colEdicHtml;
      } else {
        htmlDat = htmlDat + '<td></td>';
      }
    });
    $tab_en_edic.find('tbody').append('<tr>' + htmlDat + '</tr>');
  } else {

    var $ultFila = $tab_en_edic.find('tr:last');
    $ultFila.clone().appendTo($ultFila.parent());
    $ultFila = $tab_en_edic.find('tr:last');
    var $cols = $ultFila.find('td');
    $cols.each(function () {
      if ($(this).attr('name') == 'buttons') {

      } else {
        $(this).html('');
      }
    });
  }
  params.onAdd();
}

function TableToCSV(tabId, separator) {
  var datFil = '';
  var tmp = '';
  var $tab_en_edic = $("#" + tabId);
  $tab_en_edic.find('tbody tr').each(function () {

    if (ModoEdicion($(this))) {
      $(this).find('#bAcep').click();
    }
    var $cols = $(this).find('td');

    datFil = '';
    $cols.each(function () {
      if ($(this).attr('name') == 'buttons') {

      } else {
        datFil = datFil + $(this).html() + separator;
      }
    });
    if (datFil != '') {
      datFil = datFil.substr(0, datFil.length - separator.length);
    }
    tmp = tmp + datFil + '\n';
  });
  return tmp;
}


$("#table-list").SetEditable({
  $addButton: $('#add')
});