require "rack/jekyll"



use Rack::ShowExceptions  # Nice looking errors

run Rack::Jekyll.new(:auto => true)