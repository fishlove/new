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
          .attr('data-id', data[d].title)
          .attr('data-date', data[d].items[0].date)
          .attr('data-country', data[d].country)
          .attr('data-order', data[d].order)
          .attr('data-original-title', data[d].title)
          .find('.item-title').attr('title', data[d].title)
          .find('.name').text(data[d].title);
        $item.find('.img-contain').css('background-image', 'url('+data[d].image+')');
        $item.find('.country img')
          .attr('src', 'images/flags/'+data[d].country.toLowerCase()+'.png')
          .attr('alt', country);
        $item.find('.country span').text(country);
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
