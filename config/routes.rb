Rails.application.routes.draw do
  root to: 'pages#index'

  ## --- API namespacing
  namespace :api do
    namespace :v1 do
      scope '/timesheets' do
        get 'search' => 'timesheets#search'
      end
    end
  end
end
