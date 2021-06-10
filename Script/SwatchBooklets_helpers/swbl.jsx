// Don't use 'var SWBL' - some engines call this within a non-global scope
// if using var we end up defining this in the wrong scope

if ("undefined" == typeof SWBL) {
    SWBL = {};
}

SWBL.csvLineSplit = function csvLineSplit(in_csvLine) {

    var retVal = undefined;

    SWBL.logEntry(arguments);

    do {

        try {

            if (! in_csvLine) {
                SWBL.logError(arguments, "need in_csvLine");
                break;
            }

            var charPos = 0;
            var fields = [];
            var state = SWBL.C.CSV_STATE_IDLE;
            var curField = "";
            var curUnquotedSpaces = "";
            while (charPos < in_csvLine.length) {
                var c = in_csvLine.charAt(charPos);
                charPos++;
                switch (state) {
                    case SWBL.C.CSV_STATE_IDLE:
                        if (c == ' ' || c == '\t') {
                            state = SWBL.C.CSV_STATE_IDLE; // retain same state
                        }
                        else if (c == ',') {
                            // an empty field
                            fields.push("");
                            state = SWBL.C.CSV_STATE_IDLE; // retain same state
                        }
                        else if (c == '"') {
                            state = SWBL.C.CSV_STATE_SEEN_1ST_QUOTE;                            
                        }
                        else {
                            curField += c;
                            state = SWBL.C.CSV_STATE_UNQUOTED_FIELD;
                        }
                        break;
                    case SWBL.C.CSV_STATE_UNQUOTED_FIELD:
                        if (c == ',') {
                            // end of unquoted field
                            fields.push(curField);
                            curField = "";
                            curUnquotedSpaces = "";
                            state = SWBL.C.CSV_STATE_IDLE;
                        }
                        else if (c == ' ' || c == '\t') {
                            curUnquotedSpaces += c;
                            state = SWBL.C.CSV_STATE_UNQUOTED_FIELD; // retain same state
                        }
                        else {
                            curField += curUnquotedSpaces + c;
                            curUnquotedSpaces = "";
                            state = SWBL.C.CSV_STATE_UNQUOTED_FIELD; // retain same state
                        }
                        break;
                    case SWBL.C.CSV_STATE_SEEN_1ST_QUOTE:
                        if (c == '\\') {
                            state = SWBL.C.CSV_STATE_ESCAPED;
                        }
                        else if (c == '"') {
                            state = SWBL.C.CSV_STATE_SEEN_2ND_QUOTE;
                        }
                        else {
                            curField += c;
                            state = SWBL.C.CSV_STATE_SEEN_1ST_QUOTE; // retain same state
                        }
                        break;
                    case SWBL.C.CSV_STATE_ESCAPED:
                        curField += c;
                        state = SWBL.C.CSV_STATE_SEEN_1ST_QUOTE;
                        break;
                    case SWBL.C.CSV_STATE_SEEN_2ND_QUOTE:
                        if (c == '"') { // Allow double-up double quote inside quotes to be seen as an escaped quote
                            curField += c;
                            state = SWBL.C.CSV_STATE_SEEN_1ST_QUOTE; // retain same state
                        }
                        else if (c == ' ' || c == '\t') {
                            state = SWBL.C.CSV_STATE_AWAITING_COMMA;
                        }
                        else if (c == ',') { 
                            fields.push(curField);
                            curField = "";
                            state = SWBL.C.CSV_STATE_IDLE;
                        }
                        else {
                            fields.push(curField);
                            curField = "";
                            curField += c;
                            state = SWBL.C.CSV_STATE_UNQUOTED_FIELD;
                        }
                        break;
                    case SWBL.C.CSV_STATE_AWAITING_COMMA:
                        if (c == ',') { 
                            fields.push(curField);
                            curField = "";
                            state = SWBL.C.CSV_STATE_IDLE;
                        }
                        else if (c == ' ' || c == '\t') {
                            state = SWBL.C.CSV_STATE_AWAITING_COMMA; // retain same state
                        }
                        else if (c == '"') {
                            // Assume the comma was missing, and pretend there was one
                            fields.push(curField);
                            curField = "";
                            state = SWBL.C.CSV_STATE_SEEN_1ST_QUOTE;                            
                        }
                        else {
                            fields.push(curField);
                            curField = "";
                            curField += c;
                            state = SWBL.C.CSV_STATE_UNQUOTED_FIELD;
                        }
                        break;
                }
            }
            if (state != SWBL.C.CSV_STATE_IDLE) {
                fields.push(curField);
            }

            retVal = fields;
        }
        catch (err) {
            SWBL.logError(arguments, "throws " + err);
        }
    }
    while (false);

    SWBL.logExit(arguments);

    return retVal;

}

SWBL.getFieldValue = function getFieldValue(in_config, in_fieldName, in_csvRecord) {

    var retVal = undefined;

    SWBL.logEntry(arguments);

    do {
        try {

            if (! in_config) {
                SWBL.logError(arguments, "need in_config");
                break;
            }

            if (! in_fieldName) {
                SWBL.logError(arguments, "need in_fieldName");
                break;
            }

            if (! in_csvRecord) {
                SWBL.logError(arguments, "need in_csvRecord");
                break;
            }

            var fieldIdx = undefined;
            var fieldNameLowerCase = in_fieldName.toLowerCase();
            if (
                in_config.csvMap 
            && 
                in_config.csvMap.fieldMapInternalToCSV 
            && 
                fieldNameLowerCase in in_config.csvMap.fieldMapInternalToCSV
            ) {
                fieldNameLowerCase = in_config.csvMap.fieldMapInternalToCSV[fieldNameLowerCase].toLowerCase();
            }

            if (! fieldNameLowerCase in in_config.lowerCasedFieldSet) {
                SWBL.logError(arguments, "unknown field " + in_fieldName);
                break;
            }

            var fieldIdx = in_config.lowerCasedFieldSet[fieldNameLowerCase];
            if (fieldIdx === undefined) {
                SWBL.logError(arguments, "unknown field " + in_fieldName);
                break;
            }

            if (fieldIdx < 0 || fieldIdx >= in_csvRecord.length) {
                SWBL.logError(arguments, "fieldIdx " + fieldIdx + " out of in_csvRecord range for " + in_fieldName);
                break;
            }

            retVal = in_csvRecord[fieldIdx];            
        }
        catch (err) {
            SWBL.logError(arguments, "throws " + err);
        }
    }
    while (false);

    SWBL.logExit(arguments);

    return retVal;
}

SWBL.getFieldValueByRecordIdx = function getFieldValueByRecordIdx(in_config, in_fieldName, in_recordIdx) {

    var retVal = undefined;

    SWBL.logEntry(arguments);

    do {
        try {

            if (! in_config) {
                SWBL.logError(arguments, "need in_config");
                break;
            }

            if (! in_fieldName) {
                SWBL.logError(arguments, "need in_fieldName");
                break;
            }

            if (in_recordIdx === undefined) {
                SWBL.logError(arguments, "need in_recordIdx");
                break;
            }

            if (in_recordIdx < 0 || in_recordIdx >= in_config.data.length) {
                SWBL.logError(arguments, "in_recordIdx " + in_recordIdx + " is out of range");
                break;
            }

            var csvRecord = in_config.data[in_recordIdx];

            retVal = SWBL.getFieldValue(in_config, in_fieldName, csvRecord);
        }
        catch (err) {
            SWBL.logError(arguments, "throws " + err);
        }
    }
    while (false);

    SWBL.logExit(arguments);

    return retVal;
}

SWBL.getRecordCount = function getFieldValueByRecordIdx(in_config) {

    var retVal = undefined;

    SWBL.logEntry(arguments);

    do {
        try {

            if (! in_config) {
                SWBL.logError(arguments, "need in_config");
                break;
            }

            retVal = in_config.data.length;
        }
        catch (err) {
            SWBL.logError(arguments, "throws " + err);
        }
    }
    while (false);

    SWBL.logExit(arguments);

    return retVal;
}

SWBL.openTemplate = function openTemplate(in_csvFile) {

    var retVal = undefined;

    SWBL.logEntry(arguments);

    do {
        try {

            if (! in_csvFile) {
                SWBL.logError(arguments, "need in_csvFile");
                break;
            }

            if (! (in_csvFile instanceof File)) {
                SWBL.logError(arguments, "need in_csvFile to be a File");
                break;
            }

            if (! in_csvFile.exists) {
                SWBL.logError(arguments, "in_csvFile does not exist");
                break;
            }

            var parentFolder = in_csvFile.parent;
            var templateFile = File(parentFolder + "/" + SWBL.C.FILENAME_TEMPLATE);
            if (! templateFile.exists) {
                SWBL.logError(arguments, "templateFile does not exist");
                break;
            }

            var document = app.open(templateFile);

            retVal = document;
        }
        catch (err) {
            SWBL.logError(arguments, "throws " + err);
        }
    }
    while (false);

    SWBL.logExit(arguments);

    return retVal;
}

SWBL.parseCSV = function parseCSV(in_csvFile, in_optionalCSVMap) {

    var retVal = undefined;

    SWBL.logEntry(arguments);

    do {
        try {

            if (! in_csvFile) {
                SWBL.logError(arguments, "need in_csvFile");
                break;
            }

            if (! (in_csvFile instanceof File)) {
                SWBL.logError(arguments, "need in_csvFile to be a File");
                break;
            }

            if (! in_csvFile.exists) {
                SWBL.logError(arguments, "in_csvFile does not exist");
                break;
            }

            in_csvFile.encoding = "UTF-8";
            in_csvFile.open("r");
            var csvText = in_csvFile.read();
            in_csvFile.close();

            // Try CR+LF, then try CR, then try LF for line endings
            // to allow Windows, old Mac and new Mac text files
            var csvLines = csvText.split("\015\012");
            if (csvLines.length <= 1) {
                var csvLines = csvText.split("\015");
                if (csvLines.length <= 1) {
                    var csvLines = csvText.split("\012");
                }
            }

            var parsedData = undefined;
            for (var csvLineIdx = 0; csvLineIdx < csvLines.length; csvLineIdx++) {
                var csvLine = SWBL.trim(csvLines[csvLineIdx]);
                if (csvLine != "" && csvLine.charAt(0) != SWBL.C.CHAR_COMMENT_LINE) {
                    var csvFields = SWBL.csvLineSplit(csvLine);
                    if (! parsedData) {    
                        // First data line are column headers                
                        if (csvFields && csvFields.length >= 1) {
                            parsedData = {};
                            parsedData.fieldList = csvFields;
                            parsedData.lowerCasedFieldSet = {};
                            parsedData.data = [];
                            for (var fieldIdx = 0; fieldIdx < csvFields.length; fieldIdx++) {
                                var lowerCaseFieldName = csvFields[fieldIdx].toLowerCase();
                                if (
                                    in_optionalCSVMap 
                                && 
                                    in_optionalCSVMap.fieldMapCSVToInternal
                                && 
                                    in_optionalCSVMap.fieldMapCSVToInternal[lowerCaseFieldName]
                                ) {
                                    lowerCaseFieldName = in_optionalCSVMap.fieldMapCSVToInternal[lowerCaseFieldName]
                                }
                                parsedData.lowerCasedFieldSet[lowerCaseFieldName] = fieldIdx;
                            }
                        }
                    }
                    else {
                        parsedData.data.push(csvFields);
                    }
                }
            }

            var success = SWBL.processConfig(parsedData, in_optionalCSVMap);
            if (! success) {
                SWBL.logError(arguments, "failed to process parsedData");
                break;
            }

            retVal = parsedData;
        }
        catch (err) {
            SWBL.logError(arguments, "throws " + err);
        }
    }
    while (false);

    SWBL.logExit(arguments);

    return retVal;
}

SWBL.processConfig = function processConfig(io_config, in_optionalCSVMap) {

    var success = false;

    SWBL.logEntry(arguments);

    do {
        try {
            if (! io_config) {
                SWBL.logError(arguments, "need io_config");
                break;
            }

            if (! io_config.lowerCasedFieldSet) {
                SWBL.logError(arguments, "need io_config.lowerCasedFieldSet");
                break;
            }

            if (
            !   (            
                    (SWBL.C.LOWERCASE_FIELDNAME_COLORGROUP in io_config.lowerCasedFieldSet)
                ||
                    (in_optionalCSVMap && (SWBL.C.LOWERCASE_FIELDNAME_COLORGROUP in in_optionalCSVMap.fieldMapInternalToDefault))
                ) 
            ) {
                SWBL.logError(arguments, "need field " + SWBL.C.LOWERCASE_FIELDNAME_COLORGROUP);
                break;
            }

            if (
            !   (            
                    (SWBL.C.LOWERCASE_FIELDNAME_COLORNAME in io_config.lowerCasedFieldSet)
                ||
                    (in_optionalCSVMap && (SWBL.C.LOWERCASE_FIELDNAME_COLORNAME in in_optionalCSVMap.fieldMapInternalToDefault))
                ) 
            ) {
                SWBL.logError(arguments, "need field " + SWBL.C.LOWERCASE_FIELDNAME_COLORNAME);
                break;
            }

            if (
            !   (            
                    (SWBL.C.LOWERCASE_FIELDNAME_COLORMODEL in io_config.lowerCasedFieldSet)
                ||
                    (in_optionalCSVMap && (SWBL.C.LOWERCASE_FIELDNAME_COLORMODEL in in_optionalCSVMap.fieldMapInternalToDefault))
                ) 
            ) {
                SWBL.logError(arguments, "need field " + SWBL.C.LOWERCASE_FIELDNAME_COLORMODEL);
                break;
            }

            if (
            !   (            
                    (SWBL.C.LOWERCASE_FIELDNAME_COLORPAGE in io_config.lowerCasedFieldSet)
                ||
                    (in_optionalCSVMap && (SWBL.C.LOWERCASE_FIELDNAME_COLORPAGE in in_optionalCSVMap.fieldMapInternalToDefault))
                ) 
            ) {
                SWBL.logError(arguments, "need field " + SWBL.C.LOWERCASE_FIELDNAME_COLORPAGE);
                break;
            }

            var colorGroupFieldIdx = io_config.lowerCasedFieldSet[SWBL.C.LOWERCASE_FIELDNAME_COLORGROUP];
            var colorNameFieldIdx = io_config.lowerCasedFieldSet[SWBL.C.LOWERCASE_FIELDNAME_COLORNAME];
            var colorModelFieldIdx = io_config.lowerCasedFieldSet[SWBL.C.LOWERCASE_FIELDNAME_COLORMODEL];
            var colorPageFieldIdx = io_config.lowerCasedFieldSet[SWBL.C.LOWERCASE_FIELDNAME_COLORPAGE];

            if (! io_config.data) {
                SWBL.logError(arguments, "no color data");
                break;
            }

            if (io_config.data.length <= 0) {
                SWBL.logError(arguments, "no color data");
                break;
            }

            success = true;            

            var cyanFieldIdx = io_config.lowerCasedFieldSet[SWBL.C.LOWERCASE_FIELDNAME_CYAN];
            if (cyanFieldIdx === undefined) {
                cyanFieldIdx = io_config.lowerCasedFieldSet[SWBL.C.LOWERCASE_FIELDNAME_COLORVALUE1];
            }

            var redFieldIdx = io_config.lowerCasedFieldSet[SWBL.C.LOWERCASE_FIELDNAME_RED];
            if (redFieldIdx === undefined) {
                redFieldIdx = io_config.lowerCasedFieldSet[SWBL.C.LOWERCASE_FIELDNAME_COLORVALUE1];
            }

            var lFieldIdx = io_config.lowerCasedFieldSet[SWBL.C.LOWERCASE_FIELDNAME_L];
            if (lFieldIdx === undefined) {
                lFieldIdx = io_config.lowerCasedFieldSet[SWBL.C.LOWERCASE_FIELDNAME_COLORVALUE1];
            }

            var magentaFieldIdx = io_config.lowerCasedFieldSet[SWBL.C.LOWERCASE_FIELDNAME_MAGENTA];
            if (magentaFieldIdx === undefined) {
                magentaFieldIdx = io_config.lowerCasedFieldSet[SWBL.C.LOWERCASE_FIELDNAME_COLORVALUE2];
            }

            var greenFieldIdx = io_config.lowerCasedFieldSet[SWBL.C.LOWERCASE_FIELDNAME_GREEN];
            if (greenFieldIdx === undefined) {
                greenFieldIdx = io_config.lowerCasedFieldSet[SWBL.C.LOWERCASE_FIELDNAME_COLORVALUE2];
            }

            var aFieldIdx = io_config.lowerCasedFieldSet[SWBL.C.LOWERCASE_FIELDNAME_A];
            if (aFieldIdx === undefined) {
                aFieldIdx = io_config.lowerCasedFieldSet[SWBL.C.LOWERCASE_FIELDNAME_COLORVALUE2];
            }

            var yellowFieldIdx = io_config.lowerCasedFieldSet[SWBL.C.LOWERCASE_FIELDNAME_YELLOW];
            if (yellowFieldIdx === undefined) {
                yellowFieldIdx = io_config.lowerCasedFieldSet[SWBL.C.LOWERCASE_FIELDNAME_COLORVALUE3];
            }

            var blueFieldIdx = io_config.lowerCasedFieldSet[SWBL.C.LOWERCASE_FIELDNAME_BLUE];
            if (blueFieldIdx === undefined) {
                blueFieldIdx = io_config.lowerCasedFieldSet[SWBL.C.LOWERCASE_FIELDNAME_COLORVALUE3];
            }

            var bFieldIdx = io_config.lowerCasedFieldSet[SWBL.C.LOWERCASE_FIELDNAME_B];
            if (bFieldIdx === undefined) {
                bFieldIdx = io_config.lowerCasedFieldSet[SWBL.C.LOWERCASE_FIELDNAME_COLORVALUE3];
            }

            var blackFieldIdx = io_config.lowerCasedFieldSet[SWBL.C.LOWERCASE_FIELDNAME_BLACK];
            if (blackFieldIdx === undefined) {
                blackFieldIdx = io_config.lowerCasedFieldSet[SWBL.C.LOWERCASE_FIELDNAME_COLORVALUE4];
            }

            io_config.colorModel = undefined;
            io_config.colorGroup = undefined;
            io_config.csvMap = in_optionalCSVMap;

            for (var colorIdx = 0; colorIdx < io_config.data.length; colorIdx++) {

                var colorData = io_config.data[colorIdx];

                var colorGroup = colorData[colorGroupFieldIdx];
                if (in_optionalCSVMap && colorGroup === undefined) {
                    colorGroup = in_optionalCSVMap.fieldMapInternalToDefault.colorgroup;
                }

                var colorName = colorData[colorNameFieldIdx];
                if (in_optionalCSVMap && colorName === undefined) {
                    colorName = in_optionalCSVMap.fieldMapInternalToDefault.colorname;
                }

                var colorModel = colorData[colorModelFieldIdx];
                if (in_optionalCSVMap && colorModel === undefined) {
                    colorModel = in_optionalCSVMap.fieldMapInternalToDefault.colormodel;
                }

                var colorPage = colorData[colorPageFieldIdx];
                if (in_optionalCSVMap && colorPage === undefined) {
                    colorPage = in_optionalCSVMap.fieldMapInternalToDefault.colorpage;
                }

                var colorIsOK = true;

                if (! colorModel) {
                    colorIsOK = false;
                    SWBL.logError(arguments, "no color type for color #" + (colorIdx + 1));
                }
                else {

                    var lowercaseColorModel = colorModel.toLowerCase();
                    if (! (lowercaseColorModel in SWBL.C.SET_LOWERCASE_COLORMODEL)) {
                        colorIsOK = false;
                        SWBL.logError(arguments, "unexpected color type for color #" + (colorIdx + 1));
                    }

                    if (io_config.colorModel === undefined) {
                        io_config.colorModel = lowercaseColorModel;
                    }
                    else if (io_config.colorModel != SWBL.C.LOWERCASE_COLORMODEL_MULTIPLE && io_config.colorModel != lowercaseColorModel) {
                        io_config.colorModel = SWBL.C.LOWERCASE_COLORMODEL_MULTIPLE; 
                        SWBL.logWarning(arguments, "multiple color models in CSV");
                    }
                }

                if (colorGroup === undefined) {
                    colorIsOK = false;
                    SWBL.logError(arguments, "no color group for color #" + (colorIdx + 1));
                }
                else if (io_config.colorGroup === undefined) {
                    io_config.colorGroup = colorGroup;
                }
                else if (io_config.colorGroup != null && io_config.colorGroup != colorGroup) {
                    // If multiple color groups in CSV, set config-level colorGroup to null - 
                    // the data is only usable on a per-individual-color basis.
                    io_config.colorGroup = null; 
                }

                if (! colorName) {
                    colorIsOK = false;
                    SWBL.logError(arguments, "no color name for color #" + (colorIdx + 1));
                }

                if (! colorPage) {
                    colorIsOK = false;
                    SWBL.logError(arguments, "no color page for color #" + (colorIdx + 1));
                }

                if (colorIsOK) {
                    switch (lowercaseColorModel) {

                        default:
                            colorIsOK = false;
                            SWBL.logError(arguments, "unexpected color type for color #" + (colorIdx + 1));
                            break;
                        
                        case SWBL.C.LOWERCASE_COLORMODEL_RGB:

                            var red = colorData[redFieldIdx];
                            if (in_optionalCSVMap && red === undefined) {
                                red = in_optionalCSVMap.fieldMapInternalToDefault.red;
                            }
                            if (red === undefined) {
                                colorIsOK = false;
                                SWBL.logError(arguments, "no red for color #" + (colorIdx + 1));
                            }

                            var green = colorData[greenFieldIdx];
                            if (in_optionalCSVMap && green === undefined) {
                                green = in_optionalCSVMap.fieldMapInternalToDefault.green;
                            }
                            if (green === undefined) {
                                colorIsOK = false;
                                SWBL.logError(arguments, "no green for color #" + (colorIdx + 1));
                            }

                            var blue = colorData[blueFieldIdx];
                            if (in_optionalCSVMap && blue === undefined) {
                                blue = in_optionalCSVMap.fieldMapInternalToDefault.blue;
                            }
                            if (blue === undefined) {
                                colorIsOK = false;
                                SWBL.logError(arguments, "no blue for color #" + (colorIdx + 1));
                            }

                            if (colorIsOK) {
                                
                                red = parseInt(red, 10);
                                green = parseInt(green, 10);
                                blue = parseInt(blue, 10);

                                colorData.colorModel = SWBL.C.LOWERCASE_COLORMODEL_RGB;
                                colorData.colorGroup = colorGroup;
                                colorData.colorPage = colorPage;

                                colorData.red = red;
                                colorData.green = green;
                                colorData.blue = blue;
                            }
                            break;

                        case SWBL.C.LOWERCASE_COLORMODEL_LAB:

                            var L = colorData[lFieldIdx];
                            if (in_optionalCSVMap && L === undefined) {
                                L = in_optionalCSVMap.fieldMapInternalToDefault.l;
                            }
                            if (L === undefined) {
                                colorIsOK = false;
                                SWBL.logError(arguments, "no L value for color #" + (colorIdx + 1));
                            }

                            var a = colorData[aFieldIdx];
                            if (in_optionalCSVMap && a === undefined) {
                                a = in_optionalCSVMap.fieldMapInternalToDefault.a;
                            }
                            if (a === undefined) {
                                colorIsOK = false;
                                SWBL.logError(arguments, "no a value for color #" + (colorIdx + 1));
                            }

                            var b = colorData[bFieldIdx];
                            if (in_optionalCSVMap && b === undefined) {
                                b = in_optionalCSVMap.fieldMapInternalToDefault.b;
                            }
                            if (b === undefined) {
                                colorIsOK = false;
                                SWBL.logError(arguments, "no b value for color #" + (colorIdx + 1));
                            }

                            if (colorIsOK) {
                                
                                L = parseFloat(L);
                                a = parseFloat(a);
                                b = parseFloat(b);

                                colorData.colorModel = SWBL.C.LOWERCASE_COLORMODEL_LAB;
                                colorData.colorGroup = colorGroup;
                                colorData.colorPage = colorPage;

                                colorData.L = L;
                                colorData.a = a;
                                colorData.b = b;
                            }
                            break;

                        case SWBL.C.LOWERCASE_COLORMODEL_CMYK:
                        
                            var cyan = colorData[cyanFieldIdx];
                            if (in_optionalCSVMap && cyan === undefined) {
                                cyan = in_optionalCSVMap.fieldMapInternalToDefault.cyan;
                            }
                            if (cyan === undefined) {
                                colorIsOK = false;
                                SWBL.logError(arguments, "no cyan for color #" + (colorIdx + 1));
                            }

                            var magenta = colorData[magentaFieldIdx];
                            if (in_optionalCSVMap && magenta === undefined) {
                                magenta = in_optionalCSVMap.fieldMapInternalToDefault.magenta;
                            }
                            if (magenta === undefined) {
                                colorIsOK = false;
                                SWBL.logError(arguments, "no magenta for color #" + (colorIdx + 1));
                            }

                            var yellow = colorData[yellowFieldIdx];
                            if (in_optionalCSVMap && yellow === undefined) {
                                yellow = in_optionalCSVMap.fieldMapInternalToDefault.yellow;
                            }
                            if (yellow === undefined) {
                                colorIsOK = false;
                                SWBL.logError(arguments, "no yellow for color #" + (colorIdx + 1));
                            }

                            var black = colorData[blackFieldIdx];
                            if (in_optionalCSVMap && black === undefined) {
                                black = in_optionalCSVMap.fieldMapInternalToDefault.black;
                            }
                            if (black === undefined) {
                                colorIsOK = false;
                                SWBL.logError(arguments, "no black for color #" + (colorIdx + 1));
                            }

                            if (colorIsOK) {
                                
                                cyan = parseInt(cyan, 10);
                                magenta = parseInt(magenta, 10);
                                yellow = parseInt(yellow, 10);
                                black = parseInt(black, 10);

                                colorData.colorModel = SWBL.C.LOWERCASE_COLORMODEL_CMYK;
                                colorData.colorGroup = colorGroup;
                                colorData.colorPage = colorPage;

                                colorData.cyan = cyan;
                                colorData.magenta = magenta;
                                colorData.yellow = yellow;
                                colorData.black = black;
                            }
                            break;
                    }
                }

                success = success && colorIsOK;

            }
        }
        catch (err) {
            SWBL.logError(arguments, "throws " + err);
        }
    }
    while (false);

    SWBL.logExit(arguments);

    return success;
}

SWBL.readCSVMap = function readCSVMap(in_csvFile) {

    var retVal = undefined;

    SWBL.logEntry(arguments);

    do {
        try {

            if (! in_csvFile) {
                SWBL.logError(arguments, "need in_csvFile");
                break;
            }

            if (! (in_csvFile instanceof File)) {
                SWBL.logError(arguments, "need in_csvFile to be a File");
                break;
            }

            if (! in_csvFile.exists) {
                SWBL.logError(arguments, "in_csvFile does not exist");
                break;
            }

            var parentFolder = in_csvFile.parent;
            var csvMapFile = File(parentFolder + "/" + SWBL.C.FILENAME_CSV_MAP);
            if (! csvMapFile.exists) {
                SWBL.logError(arguments, "csvMapFile does not exist");
                break;
            }

            csvMapFile.open("r");
            csvMapFile.encoding = "UTF-8";
            var csvMapText = csvMapFile.read();
            csvMapFile.close();

            var csvMap = JSON.parse(csvMapText);
            if (! csvMap) {
                break;
            }

            // Add lowercase-only fields (e.g. add 'fieldnamemap' to csvMap
            // even if input data is spelled 'fieldNamemap' or 'FielNameMap')

            var topLevelFieldNames = [];
            for (var topLevelFieldName in csvMap) {
                topLevelFieldNames.push(topLevelFieldName);
            }

            for (var topLevelFieldIdx = 0; topLevelFieldIdx < topLevelFieldNames.length; topLevelFieldIdx++) {
                var topLevelFieldName = topLevelFieldNames[topLevelFieldIdx];
                csvMap[topLevelFieldName.toLowerCase()] = csvMap[topLevelFieldName];
            }

            // Build the maps

            csvMap.fieldMapCSVToInternal = {};

            csvMap.fieldMapInternalToCSV = {};
            csvMap.fieldMapInternalToDefault = {};

            if (csvMap.fieldnamemap) {
                for (var fieldName in csvMap.fieldnamemap) {
                    var csvFieldName = csvMap.fieldnamemap[fieldName];
                    var internalFieldName = fieldName.toLowerCase();
                    csvMap.fieldMapInternalToCSV[internalFieldName] = csvFieldName;
                    csvMap.fieldMapCSVToInternal[csvFieldName.toLowerCase()] = internalFieldName;
                }
            }

            if (csvMap.fielddefaults) {
                for (var fieldName in csvMap.fielddefaults) {
                    var internalFieldName = fieldName.toLowerCase();
                    csvMap.fieldMapInternalToDefault[internalFieldName] = csvMap.fielddefaults[fieldName];
                }
            }

            retVal = csvMap;
        }
        catch (err) {
            SWBL.logError(arguments, "throws " + err);
        }
    }
    while (false);

    SWBL.logExit(arguments);

    return retVal;
}

SWBL.selectCSV = function selectCSV() {

    var retVal = undefined;

    SWBL.logEntry(arguments);

    do {
        try {

            if (SWBL.isMac) {

                var fileNameExtensionSet = {};
                for (var extensionIdx = 0; extensionIdx < SWBL.C.DATA_FILE_EXTENSIONS_LOWERCASED.length; extensionIdx++) {
                    fileNameExtensionSet[SWBL.C.DATA_FILE_EXTENSIONS_LOWERCASED[extensionIdx]] = true;
                }

                var dataFile = 
                    File.openDialog(
                        SWBL.C.PROMPT_OPEN_DATA_FILE,
                        function(in_fileToCheck) {
                            var isFileSelectable = false;
                            var extensionToCheck = SWBL.path.filenameExtension(in_fileToCheck).toLowerCase();
                            if (in_fileToCheck instanceof Folder) {
                                isFileSelectable = true;
                            }
                            else if (fileNameExtensionSet[extensionToCheck]) {
                                isFileSelectable = true;
                            }
                            return isFileSelectable;
                        }
                    );
            }
            else {

                var fileNameExtensionFilter = "";

                for (var extensionIdx = 0; extensionIdx < SWBL.C.DATA_FILE_EXTENSIONS_LOWERCASED.length; extensionIdx++) {
                    if (extensionIdx > 0) {
                        fileNameExtensionFilter += ";"
                    }
                    fileNameExtensionFilter += SWBL.C.DATA_FILE_EXTENSIONS_LOWERCASED[extensionIdx] + ":*." + SWBL.C.DATA_FILE_EXTENSIONS_LOWERCASED[extensionIdx];
                }

                var dataFile = 
                    File.openDialog(
                        SWBL.C.PROMPT_OPEN_DATA_FILE,
                        fileNameExtensionFilter
                    );
            }

            retVal = dataFile;
        }
        catch (err) {
            SWBL.logError(arguments, "throws " + err);
        }
    }
    while (false);

    SWBL.logExit(arguments);

    return retVal;
}