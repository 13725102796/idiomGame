export function throttle(fn){
  let status = true
  return function(){
    if(!status) return 
    status = false
    setTimeout(function() {
      fn.apply(this,arguments)
      status = true
    }, 1000);
  }
}

export function debence(fn){
  let status = null
  return function (){
    clearTimeout(status)
    status = setTimeout(function(){
      fn.apply(this,arguments)
    },1000)
  }
}
export function shuffle(a) {
  var len = a.length;
 for (var i = 0; i < len - 1; i++) {
     var index = parseInt(Math.random() * (len - i));
     var temp = a[index];
     a[index] = a[len - i - 1];
     a[len - i - 1] = temp;
 }
 return a;
}

export function rnd(n, m){
  var random = Math.floor(Math.random()*(m-n+1)+n);
  return random;
}

