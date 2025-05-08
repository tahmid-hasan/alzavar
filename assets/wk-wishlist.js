console.log('loaded............')
document.addEventListener('wk:app:loaded', function(e) {
  console.log("working")
  const wk_btn = document.querySelector('.wk-button')
  console.log(e, wk_btn)
})