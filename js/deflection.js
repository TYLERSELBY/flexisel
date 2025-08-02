(function() {
    function calculateDeflection(P, L, E, I) {
        return (P * Math.pow(L, 3)) / (48 * E * I);
    }

    document.getElementById('calculate').addEventListener('click', function() {
        var load = parseFloat(document.getElementById('load').value);
        var length = parseFloat(document.getElementById('length').value);
        var elasticity = parseFloat(document.getElementById('elasticity').value);
        var inertia = parseFloat(document.getElementById('inertia').value);

        if (isNaN(load) || isNaN(length) || isNaN(elasticity) || isNaN(inertia)) {
            document.getElementById('result').textContent = 'Please enter valid numbers for all fields.';
            return;
        }
        var deflection = calculateDeflection(load, length, elasticity, inertia);
        document.getElementById('result').textContent = 'Maximum deflection: ' + deflection.toExponential(3) + ' meters';
    });
})();
