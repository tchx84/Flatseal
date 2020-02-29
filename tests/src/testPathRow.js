const {setup} = imports.utils;
setup();

const {FlatsealPathRow, mode} = imports.pathRow;


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
});
