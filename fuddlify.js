function Fud() {
  var dk = Fudk;
  var pts = dk[1];
  var ts = dk[0];
  if(pts.length == 0 || ts.length == 0 || pts.length != ts.length) return;
  var pt = pts.shift();
  var t = ts.shift();
  Fud.dk = dk;
  return atob(pt.map(function(i) {
    return Fud.d([t[i] * 2]);
  }).join(""));
}

Fud.u = function(n) {
  var w = Math.floor((Math.sqrt(8 * n + 1) - 1) / 2);
  var t = (w ** 2 + w) / 2;
  var b = n - t;
  var a = w - b;
  return [a, b];
}

Fud.d = function(l) {
  var r = "";
  l.map(function(m) {
    return Fud.u(m);
  }).forEach(function(p) {
    p.forEach(function(n) {
      if(n == 0) return;
      else r += String.fromCharCode(n - 1);
    });
  });
  return r;
}