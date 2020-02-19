jasmine = find_program('jasmine', required: false)
if jasmine.found()
  env = environment()
  env.set('LC_ALL', 'C')

  tests = join_paths(meson.current_source_dir(), 'src')

  test('Jasmine tests', jasmine,
    env: env,
    args: ['--no-config', '--verbose', '--no-color', tests])
endif
