import DataRow from '/base/js/Data/DataRow.js';
import DataTable from '/base/js/Data/DataTable.js';

QUnit.test('DataTable and DataRow events', function (assert) {

    const registeredEvents = [];

    /** @param {DataRow.ColumnEventObject|DataTable.RowEventObject} e */
    function registerEvent(e) {
        registeredEvents.push(e.type);
    }

    /** @param {DataRow} row */
    function registerRow(row) {
        row.on('clearRow', registerEvent);
        row.on('afterClearRow', registerEvent);
        row.on('deleteColumn', registerEvent);
        row.on('afterDeleteColumn', registerEvent);
        row.on('insertColumn', registerEvent);
        row.on('afterInsertColumn', registerEvent);
        row.on('updateColumn', registerEvent);
        row.on('afterUpdateColumn', registerEvent);
    }

    /** @param {DataTable} table */
    function registerTable(table) {
        table.on('clearTable', registerEvent);
        table.on('afterClearTable', registerEvent);
        table.on('deleteRow', registerEvent);
        table.on('afterDeleteRow', registerEvent);
        table.on('insertRow', registerEvent);
        table.on('afterInsertRow', registerEvent);
        table.on('afterUpdateRow', registerEvent);
        table.getAllRows().forEach(registerRow);
    }

    const dataTable = DataTable.fromJSON({
        _DATA_CLASS_NAME_: 'DataTable',
        rows: [{
            _DATA_CLASS_NAME_: 'DataRow',
            id: 'a',
            text: 'text'
        }]
    });
    const dataRow = new DataRow({
        _DATA_CLASS_NAME_: 'DataRow',
        id: 'b',
        text: 'text'
    });

    registerTable(dataTable);
    registerRow(dataRow);

    registeredEvents.length = 0;
    dataTable.insertRow(dataRow);
    assert.deepEqual(
        registeredEvents,
        [
            'insertRow',
            'afterInsertRow',
        ],
        'Events for DataTable.insertRow should be in expected order.'
    );

    registeredEvents.length = 0;
    dataTable.getRow('a').updateColumn('text', 'test');
    assert.deepEqual(
        registeredEvents,
        [
            'updateColumn',
            'afterUpdateRow', // table gets informed first because of initial JSON
            'afterUpdateColumn',
        ],
        'Events for DataRow.updateColumn (1) should be in expected order.'
    );

    registeredEvents.length = 0;
    dataRow.insertColumn('new', 'new');
    assert.deepEqual(
        registeredEvents,
        [
            'insertColumn',
            'afterInsertColumn',
            'afterUpdateRow',
        ],
        'Events DataRow.insertColumn should be in expected order.'
    );

    registeredEvents.length = 0;
    dataRow.updateColumn('text', 'test');
    assert.deepEqual(
        registeredEvents,
        [
            'updateColumn',
            'afterUpdateColumn',
            'afterUpdateRow',
        ],
        'Events DataRow.updateColumn (2) should be in expected order.'
    );

    registeredEvents.length = 0;
    dataRow.deleteColumn('new');
    assert.deepEqual(
        registeredEvents,
        [
            'deleteColumn',
            'afterDeleteColumn',
            'afterUpdateRow',
        ],
        'Events DataRow.updateColumn (2) should be in expected order.'
    );

    registeredEvents.length = 0;
    dataRow.clear();
    assert.deepEqual(
        registeredEvents,
        [
            'clearRow',
            'afterClearRow',
            'afterUpdateRow',
        ],
        'Events DataRow.clear should be in expected order.'
    );

    registeredEvents.length = 0;
    dataTable.clear();
    assert.deepEqual(
        registeredEvents,
        [
            'clearTable',
            'afterClearTable'
        ],
        'Events DataTable.clear should be in expected order.'
    );

});

QUnit.test('DataTable JSON support', function (assert) {

    const json = {
        _DATA_CLASS_NAME_: 'DataTable',
        rows: [{
            _DATA_CLASS_NAME_: 'DataRow',
            id: 'a',
            column1: 'value1',
            column2: 0.0002,
            column3: false
        }, {
            _DATA_CLASS_NAME_: 'DataRow',
            id: 'b',
            column1: 'value1',
            column2: 'value2',
            column3: {
                _DATA_CLASS_NAME_: 'DataTable',
                rows: [{
                    _DATA_CLASS_NAME_: 'DataRow',
                    id: 'ba',
                    column1: 'value1'
                }, {
                    _DATA_CLASS_NAME_: 'DataRow',
                    id: 'bb',
                    column1: 'value1'
                }, {
                    _DATA_CLASS_NAME_: 'DataRow',
                    id: 'bc',
                    column1: 'value1'
                }]
            }
        }, {
            _DATA_CLASS_NAME_: 'DataRow',
            id: 'c',
            column1: 'value1',
            column2: 'value2',
            column3: 'value3'
        }]
    };

    const table = DataTable.fromJSON(json);

    const rowA = table.getRow('a');
    const rowB = table.getRow('b');
    const rowC = table.getRow('c');

    assert.deepEqual(
        [
            table.getRowCount(),
            rowA && rowA.id,
            rowB && rowB.id,
            rowC && rowC.id,
        ], [
            3,
            'a',
            'b',
            'c',
        ],
        'Table should contain three rows.'
    );

    assert.deepEqual(
        rowA && rowA.getAllColumns(),
        {
            'column1': 'value1',
            'column2': 0.0002,
            'column3': false
        },
        'First row should contain three columns.'
    );

    const tableB3 = rowB.getColumn('column3');
    const rowBA = tableB3.getRow('ba');
    const rowBB = tableB3.getRow('bb');
    const rowBC = tableB3.getRow('bc');

    assert.deepEqual(
        [
            tableB3.getRowCount(),
            rowBA && rowBA.id,
            rowBB && rowBB.id,
            rowBC && rowBC.id,
        ], [
            3,
            'ba',
            'bb',
            'bc',
        ],
        'Inner table should contain three rows.'
    );

    assert.deepEqual(
        table.toJSON(),
        json,
        'Exported JSON of table should be equal to imported JSON.'
    );

});