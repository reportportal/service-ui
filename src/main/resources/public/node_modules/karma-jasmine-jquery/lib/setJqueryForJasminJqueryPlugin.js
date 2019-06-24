var $j;
if (jQuery && jQuery.noConflict){
  $j = jQuery.noConflict();
}

if (currentJquery && currentJquery.JQuery){
  window.JQuery = currentJquery.JQuery;
  window.$ = currentJquery.$;
}
