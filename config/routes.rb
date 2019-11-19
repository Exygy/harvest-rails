Rails.application.routes.draw do
  ## --- API namespacing
  namespace :api do
    namespace :v1 do
      scope '/timesheets' do
        get 'search' => 'timesheets#search'
      end
      scope '/projects' do
        get 'search' => 'projects#search'
      end
    end
  end

  root to: 'pages#index'
  # required for client-side routing
  get '*path' => 'pages#index'
end
