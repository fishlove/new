// Custom sorting plugin
(function($) {
    $.fn.sorted = function(params) {
        var defaults = {
            reverse: false,
            sortBy: false,
            filter: false,
            limit: false,
            start: 0
        };
        var options = $.extend({}, defaults, params);
        
        var $data = $(this).clone();
        
        if(options.filter) {
            
        }
        
        if(options.sortBy) {
            var items = $data.get();
            items.sort(function(a, b) {
                if(typeof(options.sortBy) === 'string') {
                    var sortBy = options.sortBy;
                    // attribute e.g. "[data-id]"
                    if(sortBy.match(/\[[^\]\t\n\f \/>"'=]+\]/)) {
                        options.sortBy = function(el) {
                            return $(el).attr(sortBy.replace(/\[|\]/g, ''));
                        };
                    }
                    // css selector e.g. ".name"
                    else {
                        options.sortBy = function(el) {
                            return $(el).find(sortBy).text();
                        };
                    }
                }
                var valA = options.sortBy($(a));
                var valB = options.sortBy($(b));
                if (options.reverse) {
                    return (valA < valB) ? 1 : (valA > valB) ? -1 : 0;
                } else {
                    return (valA < valB) ? -1 : (valA > valB) ? 1 : 0;
                }
            });
            if(options.limit) {
                items = items.slice(options.start, options.start + options.limit);
            }
            $data = $(items);
        }
        
        return $data;
    };
})(jQuery);

var quicksand = (function( data ) {
    var $filter = $('#filter'),
        sort = '#sort :checked',
        order = '#order :checked',
        $container = $('.filter-container'),
        $selector = '.filter-item',
        $filteredData;

    var source = "<ul>";
    for (var d in data) {
        var $item = $( $($selector).clone()[0].outerHTML );
        var country = $('option[value="'+data[d].country+'"]').text();
        $item
          .attr('data-id', d)
          .attr('data-date', data[d].items[0].date)
          .attr('data-country', data[d].country)
          .attr('data-order', data[d].order)
          .attr('data-original-title', data[d].title)
          .find('.item-title').attr('title', d)
          .find('.name').html(d);
        $item.find('.img-contain').css('background-image', 'url('+data[d].image+')');
        if(data[d].country) {
            $item.find('.country img')
              .attr('src', $('#filter option[value='+data[d].country+']').data('flag'))
              .attr('alt', country);
            $item.find('.country span').text(country);
        }
        source += $item[0].outerHTML;
    }
    source += "</ul>";
    var $data = $(source), 
        $sortedData = $data.find($selector);
    
    $('#loadmore_press').on('click', function() {
        
        // finally, call quicksand
        $container.quicksand($sortedData.slice(0, $container.find($selector).length + 15), {
            duration: 1000,
            easing: "swing",
            selector: ".filter-item",
            adjustWidth: false,
            attribute: "data-id",
            useScaling: true
        }, function() {
            if($sortedData.length > $container.find($selector).length) {
                $('#loadmore_press').show();
            } else {
                $('#loadmore_press').hide();
            }
        });
    });
    
    // attempt to call Quicksand on every form change
    $('.filter-sort form').change(function(e) {
        var $sort = $(sort),
            $order = $(order);
        
        if ($filter.val().length !== 2) {
            $filteredData = $data.find($selector);
        } else {
            $filteredData = $data.find($selector + '[data-country="' + $filter.val() + '"]');
        }
        
        $sortedData = $filteredData.sorted({
            sortBy: ($sort.val() == "name" ? '.name' : '[data-' + $sort.val() + ']'),
            reverse: ($order.val() == 'desc')
        });
        
        
        // finally, call quicksand
        $container.quicksand($sortedData.slice(0, ($container.find($selector).length > 15 ? $container.find($selector).length : 15)), {
            duration: 1000,
            easing: "swing",
            selector: ".filter-item",
            adjustWidth: false,
            attribute: "data-id",
            useScaling: true
        }, function() {
            if($sortedData.length > $container.find($selector).length) {
                $('#loadmore_press').show();
            } else {
                $('#loadmore_press').hide();
            }
        });
    });
});

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
                var title = $el.data("id"),
                    item = data[title].items,
                    table = "";
                item = sort('date', item);
                for (var i = 0; i < item.length; i++) {
                    item[i].date = new Date(item[i].date);
                    item[i].date = item[i].date.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                    table += '<tr><td class="lead">'+item[i].date+'</td><td class="text-right">'+
                      (item[i].url ?
                        '<a class="btn btn-primary" href="'+item[i].url+'" target="_blank">'+
                          'View '+(item[i].archive?' (archive)':'')+
                        '</a>' :
                        '<span class="text-muted">Not available online</span>'
                      )+
                      '</td></tr>';
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
            return false;
        });
    });
}
$("#filter").select2({
    templateResult: function (e) {
        if (!e.id) { 
            return e.text; 
        }
        return $('<span><img src="' + e.element.dataset.flag + '" /> ' + e.text + '</span>');
    }
});
