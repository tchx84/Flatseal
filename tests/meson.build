jasmine = find_program('jasmine', required: false)
if jasmine.found()
  env = environment()
  env.set('GJS_PATH', join_paths(meson.source_root()))
  env.set('LC_ALL', 'C')

  tests = join_paths(meson.current_source_dir(), 'src')

  test('Unit tests', jasmine,
    env: env,
    args: ['--no-config', '--verbose', '--no-color', tests])
endif
