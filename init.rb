require 'cag/group_patch'
require 'cag/issue_patch'
require 'cag/issues_controller_patch'

Redmine::Plugin.register :redmine_csme_asignaciones do
  name 'Redmine Csme Asignacion Grupos plugin'
  author 'jresinas, mabalos'
  description 'Plugin de Redmine que pertime la asignacion de grupos en las peticiones.'
  version '0.1.0'
  author_url 'http://www.emergya.es'

  requires_redmine_plugin :adapter_deface, :version_or_higher => '0.0.1'
  settings :default => {}, :partial => 'settings/redmine_csme_asignaciones'
end
