function unselect_press() {
    $(".gallery .active").css('padding-bottom', '').removeClass('active');
    $(".blurb").remove();
}
function sort(prop, arr) {
    prop = prop.split('.');
    var len = prop.length;

    arr.sort(function (a, b) {
        var i = 0;
        while( i < len ) { a = a[prop[i]]; b = b[prop[i]]; i++; }
        if (a < b) {
            return -1;
        } else if (a > b) {
            return 1;
        } else {
            return 0;
        }
    });
    return arr;
}
if($('a.press_item').length) {
    $.getJSON( "api/press.json", function( data ) {
        quicksand(data);
        $(document).on('click', "*:not(.blurb)", unselect_press);
        $(".gallery").on('click', ".press_item", function (e) {
            unselect_press();
            var $el = $(this).parent();
            if(!$el.hasClass('active')) {
                var title = $el.find(".name").text(),
                    item = data[title].items,
                    table = "";
                item = sort('date', item);
                for (var i = 0; i < item.length; i++) {
                    item[i].date = new Date(item[i].date);
                    item[i].date = item[i].date.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                    table += '<tr><td class="lead">'+item[i].date+'</td><td><a class="btn btn-primary" href="'+item[i].url+'" target="_blank">View</a></td></tr>';
                }
                table = "<h3>Fishlove features on "+title+"</h3><table class='table table-striped text-left'><thead><tr><th>Date</th><th></th></tr></thead><tbody>"+table+"</tbody></table>";
                $(".gallery").css('height', '');
                $el
                  .addClass('active')
                  .append('<div class="blurb">' + table + '</div>')
                  .css('padding-bottom', $('.blurb').height());
                
                // scroll to open press item
                $('html,body').animate({
                    scrollTop: $el.offset().top
                }, 600, function() {
                    if( $(window).scrollTop() >= $('#nav').height() ) {
                        $('#nav').addClass('nav-up');
                    }
                });
            }
            console
            return false;
        });
    });
}
