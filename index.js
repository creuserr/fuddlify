function Fuddlify(codes) {
  codes = typeof codes == "object" ? codes : [codes];
  Fuddlify.tokens = [];
  Fuddlify.pointers = [];
  codes.forEach(function(code) {
    var token = Fuddlify.tokenize(code);
    Fuddlify.tokens.push(token.tokens);
    Fuddlify.pointers.push(token.pointer);
  });
  return [Fuddlify.tokens, Fuddlify.pointers];
}

Fuddlify.next = function() {
  if(Fuddlify.pointers.length == 0 || Fuddlify.tokens.length == 0 || Fuddlify.pointers.length != Fuddlify.tokens.length) return;
  var pointer = Fuddlify.pointers.shift();
  var token = Fuddlify.tokens.shift();
  return atob(pointer.map(function(index) {
    return Fuddlify.decompress([token[index] * 2]);
  }).join(""));
}

Fuddlify.tokenize = function(code) {
  code = code.toString();
  var arr = Fuddlify.compress(btoa(code)).map(function(num, i) {
    return {
      number: num / 2,
      index: i
    }
  });
  arr = Fuddlify.shuffle(arr);
  var final = Fuddlify.compress(btoa(code)).map(function(z, i) {
    var c = 0;
    arr.forEach(function(a, ii) {
      if(i == a.index) c = ii;
    });
    return c;
  });
  return {
    pointer: final,
    tokens: arr.map(function(item) {
      return item.number;
    })
  };
}

Fuddlify.pair = function([a, b]) {
  return 0.5 * (a + b) * (a + b + 1) + b;
}

Fuddlify.unpair = function(n) {
  var w = Math.floor((Math.sqrt(8 * n + 1) - 1) / 2);
  var t = (w ** 2 + w) / 2;
  var b = n - t;
  var a = w - b;
  return [a, b];
}

Fuddlify.compress = function(text) {
  var nums = text.split("").map(function(char) {
  return char.charCodeAt(0) + 1;
  });
  var pairs = [];
  var cur = null;
  nums.forEach(function(num) {
    if(cur == null) cur = num;
    else {
      pairs.push([cur, num]);
      cur = null;
    }
  });
  if(cur != null) pairs.push([cur, 0]);
  return pairs.map(function(pair) {
    return Fuddlify.pair(pair);
  });
}

Fuddlify.shuffle = function(raw) {
  function random(max) {
    return Math.floor(Math.random() * max);
  }
  var arr = [];
  var is = [];
  raw.forEach(function() {
    var i = random(raw.length);
    while(is.includes(i)) {
      i = random(raw.length);
    }
    is.push(i);
    var ins = random(arr.length);
    arr = Fuddlify.insert(arr, raw[i], ins);
  });
  return arr;
}

Fuddlify.insert = function(raw, val, x) {
  var n = [];
  for(var i = 0; i < x; i++) {
    n.push(raw[i]);
  }
  n.push(val);
  for(var i = x; i < raw.length; i++) {
    n.push(raw[i]);
  }
  return n;
}

Fuddlify.decompress = function(list) {
  var res = "";
  list.map(function(item) {
    return Fuddlify.unpair(item);
  }).forEach(function(pair) {
    pair.forEach(function(num) {
      if(num == 0) return;
      else res += String.fromCharCode(num - 1);
    });
  });
  return res;
}

var count = 0;
function refresh() {
  $("[data-input]").off("input");
  var target = $([...$("[data-input]")].pop());
  target.on("input", function(evt) {
    $("#btn-add").toggle(evt.target.value.length > 0);
  });
}

function add() {
  count++;
  var html = "";
  html += `<div class="d-flex gap-3 align-items-center my-1">`;
  html += `<p class="m-0">${count + 1}</p>`;
  html += `<input type="text" class="form-control" placeholder="Variable" data-input="${count}"></div>`;
  var e = document.createElement("div");
  $("#inputs")[0].append(e);
  e.outerHTML = html;
  $("#btn-add").hide();
  refresh();
}

function reset() {
  count = 0;
  var html = "";
  html += `<div class="d-flex gap-3 align-items-center my-1">`;
  html += `<p class="m-0">1</p>`;
  html += `<input type="text" class="form-control" placeholder="Variable" data-input="0"></div>`;
  $("#btn-add").hide();
  $("#inputs").html(html);
  refresh();
}

function backFirst(r) {
  if(r == 1) reset();
  $("#card-second, #card-third").hide();
  $("#card-first").show();
}

var variables = [];
var fud = null;
function toSecond() {
  variables = [...$("[data-input]")].map(function(target) {
    return target.value;
  });
  fud = Fuddlify(variables);
  $("#datakeys").val(`window.Fudk = ${JSON.stringify(fud)};`);
  $("#card-first").hide();
  $("#card-second").show();
}

function toThird() {
  $("#card-second").hide();
  $("#card-third").show();
}

function openHelp(i) {
  var helps = [{
    title: "Re-entering the secrets",
    subtitle: `Once the <span class="mono bg-light rounded p-1 px-2">Fud();</span> is triggered, it will select the next variable, return it, and then removes it. If you are using a variable muliple times, you need to re-enter it as it will be removed once fetched.`
  }, {
    title: "Datakeys",
    subtitle: `Datakeys are the obfuscated data of all the secrets. You can generate it again if you want.<br><br>If a single number or array is missing, it will corrupt and might throws an error.`
  }, {
    title: "Source Code",
    subtitle: `This will be the guide to decrypt the data. You can also just use a script tag with the source <span class="mono bg-light rounded p-1 px-2">https://cdn.jsdelivr.net/gh/creuserr/fuddlify/fuddlify.min.js</span>.`
  }];
  $("#title").text(helps[i].title);
  $("#subtitle").html(helps[i].subtitle);
  $("#help").show();
}

function closeHelp() {
  $("#help").hide();
}

$(document).ready(async function() {
  refresh();
  var f = await fetch("fuddlify.js");
  var r = await f.text();
  $("#source").val(r);
});