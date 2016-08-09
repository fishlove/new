require "net/http"
require "json"
require 'uri'

module Jekyll
  module LinkCheckFilter

    # Check whether a link is live
    #
    # input - The URL to check
    #
    # Returns boolean 
    def check_link(url_string)
      @current = "'#{url_string}' in " + @context.registers[:page]["path"]
      
      url = valid_url(url_string)
      unless url
        Jekyll.logger.warn "Link Error:", "#{@current} is not a valid URL"
        return false
      end
      
      # try to get from cache
      @context.registers[:site].data[:checked_links] ||= {}
      links = @context.registers[:site].data[:checked_links]
      return links[url_string] if links.key?(url_string)
      
      @context.registers[:site].data[:checked_links][url_string] = check(url)
    end

    # Get a webpage from the webarchive wayback machine
    #
    # input - The URL to get
    #
    # Returns the URL on webarchive.
    def wayback(url)
      return false unless valid_url(url)
      
      @context.registers[:site].data[:wayback_links] ||= {}
      links = @context.registers[:site].data[:wayback_links]
      return links[url] if links.key?(url)
      
      uri = URI("http://archive.org/wayback/available?url=" + url)
      data = JSON.parse(Net::HTTP.get(uri))["archived_snapshots"]
      archive_url = data.key?("closest") ? data["closest"]["url"] : false
      
      @context.registers[:site].data[:wayback_links][url] = archive_url
    end
    
    
    private
    def check(url)
      res, success = nil
      Net::HTTP.start(url.host, url.port, :read_timeout => 30 , :use_ssl => (url.scheme == 'https')) do |http|
        res = http.request_head url.path
        success = (res.code[0].to_i < 4 ) # Not 4xx or 5xx
        unless success # try a GET request in case HEAD requests are blocked by the host
          res = http.request_get(url)
          success = (res.code[0].to_i < 4)
        end
      end
      
      # follow redirects
      if res.kind_of?(Net::HTTPRedirection)
        location = res['location']
        if location[0] == "/" && location[1] != "/" # relative url
          location = url.scheme + "://" + url.host + (url.port.nil? ? '' : ':' + url.port.to_s) + location
        end
        if location == url.to_s
          Jekyll.logger.warn "Link Error:", "#{url} redirects to itself"
          return false 
        end
        Jekyll.logger.info "Link Warning:", "#{@current} redirects (#{res.code}) to #{location}"
        return check(valid_url(location))
      end
      
      Jekyll.logger.warn "Link Error:", "#{res.code} #{res.message} returned for #{@current}" unless success
      success
      
    rescue Exception => details
      details = details.to_s.split("getaddrinfo: ").last unless details.nil?
      Jekyll.logger.warn "Link Error:", "#{details} #{@current}"
      false
    end
    
    private
    def valid_url(url)
      uri = URI(url)
      return false unless uri.kind_of?(URI::HTTP)
      uri.path = '/' if uri.path.empty?
      uri
    rescue URI::InvalidURIError
      false
    end
    
  end
end

Liquid::Template.register_filter(Jekyll::LinkCheckFilter)