project('flatseal',  
          version: '1.5.1',
    meson_version: '>= 0.50.0',
  default_options: [ 'warning_level=2',
                   ],
)

i18n = import('i18n')


subdir('data')
subdir('src')
subdir('po')
subdir('tests')

meson.add_install_script('postinstall.py')
