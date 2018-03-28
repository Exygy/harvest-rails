class ApplicationController < ActionController::Base
  protect_from_forgery with: :exception

  if Rails.env.production? && ENV['HTTP_BASIC_AUTH_USERNAME'] && ENV['HTTP_BASIC_AUTH_PASSWORD']
    http_basic_authenticate_with name: ENV['HTTP_BASIC_AUTH_USERNAME'], password: ENV['HTTP_BASIC_AUTH_PASSWORD']
  end
end
