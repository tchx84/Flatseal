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
  input: 'com.github.tchx84.Flatseal.metainfo.xml.in',
  output: 'com.github.tchx84.Flatseal.metainfo.xml',
  po_dir: '../po',
  install: true,
  install_dir: join_paths(get_option('datadir'), 'metainfo')
)

appstreamcli = find_program('appstreamcli', required: false)
if appstreamcli.found()
  test('Validate appstream file', appstreamcli,
    args: ['validate', '--no-net', '--explain', appstream_file]
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
