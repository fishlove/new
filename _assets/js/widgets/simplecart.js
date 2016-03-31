simpleCart({
    checkout: {
        type: "PayPal",
        email: "nicky@fishlove.co.uk"
    },
    currency: "GBP",
    cartColumns: [
        { view: function(item, column){
            return  '<a class="thumbnail" href="' + item.get('url') + '"><img src="' + item.get('thumb') + '" alt="' + item.get('name') + '"></a>';
          }, attr: "thumb", label: false
        } ,
        { view: function(item, column){
            return  '<p><a href="' + item.get('url') + '" class="h4">' + item.get('name') + '</a><br>' +
                    'Size: ' + item.get('size') + 
                    (item.get('params') ? '<br>' + item.get('params') : '') + 
                    '</p>' +
                    '<a href="javascript:;" class="simpleCart_remove">Remove</a>';
          }, attr: "name", label: "Name"} ,
        { attr: "price" , label: "Price", view: 'currency' } ,
        { view: function(item, column){
            return  '<a href="javascript:;" class="simpleCart_decrement">-</a> ' +
                    item.quantity() + ' ' +
                    '<a href="javascript:;" class="simpleCart_increment">+</a>';
          }, attr: "custom", label: "Quantity"
        }
    ]
});
simpleCart.bind( "afterAdd" , function( item ) {
    toastr.success( item.get("name") + (item.get("params") ? " - " + item.get("params") : '') + " - " + item.get("size") + " was added to the basket." );
    
    setTimeout(function() {
        var quantity = simpleCart.quantity();
        toastr.info( 
            "Your new sub-total is " + simpleCart.toCurrency( simpleCart.total() ) + " (" + quantity + " item" + (quantity !== 1 ? "s" : "") + "). &nbsp; " +
            "<a class='btn btn-primary' href='" + $('a.navbar-cart').attr('href') + "'>" +
            "<span class='fa fa-shopping-cart'></span> View basket</a>"
        );
    }, 1000);
});
simpleCart.bind( "update", function(e) {
    $el = $('.navbar-cart');
    $btn = $el.find('.btn');
    $btn.css('transition', '1s ease all');
    if(simpleCart.quantity()) {
        $('.simpleCart_checkout').attr('disabled', false);
        $el.fadeIn('1000');
        $btn.addClass('btn-primary');
        setTimeout(function() {
            $btn.removeClass('btn-primary');
        }, 1000);
    }
    else {
        $('.simpleCart_checkout').attr('disabled', true);
        $('.navbar-cart').fadeOut('slow');
    }
});
$('.item_size, .item_param').on('change', function() {
    var $el = $('.item_size option:selected'), 
        price = $el.data('price'),
        params = [];
    $('.item_param:checked').each(function() {
        var $item = $(this);
        params.push($item.next('span').text());
        switch ($item.data('modifier')) {
          case '+':
            price += $item.data('price');
            break;
          case '-':
            price -= $item.data('price');
            break;
          case '=':
            price = $item.data('price');
            break;
        }
    });
    $('.item_price span').text(price);
    $('.item_params').text(params.join(", "));
    $('.poster-size').text($el.data('size'));
});
function get_cart_count() {
    var quantity = simpleCart.quantity();
    return quantity + " item" + quantity !== 1 ? "s" : "";
}
