desktop_file = i18n.merge_file(
  input: 'com.github.tchx84.Flatseal.desktop.in',
  output: 'com.github.tchx84.Flatseal.desktop',
  type: 'desktop',
  po_dir: '../po',
  install: true,
  install_dir: join_paths(get_option('datadir'), 'applications')
)

desktop_utils = find_program('desktop-file-validate', required: false)
if desktop_utils.found()
  test('Validate desktop file', desktop_utils,
    args: [desktop_file]
  )
endif

appstream_file = i18n.merge_file(
  input: 'com.github.tchx84.Flatseal.appdata.xml.in',
  output: 'com.github.tchx84.Flatseal.appdata.xml',
  po_dir: '../po',
  install: true,
  install_dir: join_paths(get_option('datadir'), 'appdata')
)

appstreamcli = find_program('appstreamcli', required: false)
if appstreamcli.found()
  test('Validate appstream file', appstreamcli,
    args: ['validate', '--no-net', '--explain', appstream_file]
  )
endif

install_data(
  'com.github.tchx84.Flatseal.gschema.xml',
  install_dir: join_paths(get_option('datadir'), 'glib-2.0', 'schemas')
)

compile_schemas = find_program('glib-compile-schemas', required: false)
if compile_schemas.found()
  test('Validate schema file', compile_schemas,
    args: ['--strict', '--dry-run', meson.current_source_dir()]
  )
endif

conf = configuration_data()
conf.set('prefix', get_option('prefix'))
conf.set('bindir', get_option('bindir'))

configure_file(
  input: 'com.github.tchx84.Flatseal.service.in',
  output: 'com.github.tchx84.Flatseal.service',
  configuration: conf,
  install_dir: join_paths(get_option('datadir'), 'dbus-1', 'services')
)

subdir('icons')
