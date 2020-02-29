const {setup} = imports.utils;
setup();

const {FlatsealPathRow, mode, validity} = imports.pathRow;


describe('FlatsealPathRow', function() {
    var row;

    beforeEach(function() {
        row = new FlatsealPathRow();
    });

    it('starts empty', function() {
        expect(row.text).toEqual('');
    });

    it('processes path correctly', function() {
        const text = 'home:ro';
        row.text = text;

        expect(row.text).toEqual(text);
    });

    it('sets ready-only style class', function() {
        row.text = 'home:ro';
        const context = row.get_style_context();

        expect(context.has_class(mode.READONLY)).toBe(true);
        expect(context.has_class(mode.READWRITE)).toBe(false);
        expect(context.has_class(mode.CREATE)).toBe(false);
    });

    it('sets ready-write style class', function() {
        row.text = 'home:rw';
        const context = row.get_style_context();

        expect(context.has_class(mode.READONLY)).toBe(false);
        expect(context.has_class(mode.READWRITE)).toBe(true);
        expect(context.has_class(mode.CREATE)).toBe(false);
    });

    it('sets ready-write style class (default)', function() {
        row.text = 'home';
        const context = row.get_style_context();

        expect(context.has_class(mode.READONLY)).toBe(false);
        expect(context.has_class(mode.READWRITE)).toBe(true);
        expect(context.has_class(mode.CREATE)).toBe(false);
    });

    it('sets create style class', function() {
        row.text = 'home:create';
        const context = row.get_style_context();

        expect(context.has_class(mode.READONLY)).toBe(false);
        expect(context.has_class(mode.READWRITE)).toBe(false);
        expect(context.has_class(mode.CREATE)).toBe(true);
    });

    function _handles(description, path, _mode) {
        it(`handles ${description} paths (${_mode ? _mode : 'default'})`, function() {
            row.text = `${path}${_mode}`;
            const context = row.get_style_context();

            expect(context.has_class(validity.VALID)).toBe(true);
            expect(context.has_class(validity.NOTVALID)).toBe(false);
        });
    }
    _handles('absolute', '/home/.test', '');
    _handles('absolute', '/home/.test', ':ro');
    _handles('absolute', '/home/.test', ':rw');
    _handles('absolute', '/home/.test', ':create');
    _handles('relative', '~/.test', '');
    _handles('relative', '~/.test', ':ro');
    _handles('relative', '~/.test', ':rw');
    _handles('relative', '~/.test', ':create');
    _handles('token-based', 'home/.test', '');
    _handles('token-based', 'home/.test', ':ro');
    _handles('token-based', 'home/.test', ':rw');
    _handles('token-based', 'home/.test', ':create');

    function _catches(description, path, _mode) {
        it(`catches ${description} paths (${_mode ? _mode : 'default'})`, function() {
            row.text = `${path}${_mode}`;
            const context = row.get_style_context();

            expect(context.has_class(validity.VALID)).toBe(false);
            expect(context.has_class(validity.NOTVALID)).toBe(true);
        });
    }
    _catches('not-valid absolute', '/home/ .test ', '');
    _catches('not-valid relative', '~/ .test ', '');
    _catches('not-valid token-based', 'jome/.test ', '');
    _catches('not-valid mode', 'home', ':');
    _catches('not-valid mode', 'home', ':not');
});
