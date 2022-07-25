import * as d3 from "https://cdn.skypack.dev/d3@7";

window.addEventListener('load', function() {
    fetch('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json')
    .then(response => response.json())
    .then(data =>
        buildGraph(data)
    )
})

function buildGraph(data) {
    const svgHeight = 500;
    const svgWidth = 750;
    const padding = 30;

    const svgContainer = d3.select('#graph')
    .append('svg')
    .attr('height', svgHeight + padding)
    .attr('width', svgWidth + padding * 2);

    function buildScales(data) {
        const dataYear = data.map(item => new Date(item['Year']));
        const dataTime = data.map(item => {
            let newTimeMS = item['Time'].split(':')
            return item['Time'] = new Date(1969, 0, 1, 0, newTimeMS[0], newTimeMS[1]);
        });
        const timeFormat = d3.timeFormat('%M:%S');

        // Eixo X
        const xMinVal = d3.min(data, (d) => d.Year - 1);
        const xMaxVal = d3.max(data, (d) => d.Year);

        const xAxisScale = d3.scaleLinear()
        .range([padding, svgWidth])
        .domain([xMinVal, xMaxVal]);

        const xAxis = d3.axisBottom(xAxisScale).tickFormat(d3.format('d'));
        svgContainer.append('g')
        .attr('transform', `translate(${padding}, ${svgHeight})`)
        .call(xAxis)
        .attr('id', 'x-axis');

        // Eixo Y
        const yVal = d3.extent(data, (d) => d.Time);

        const yAxisScale = d3.scaleTime()
        .range([0, svgHeight])
        .domain(yVal);

        const yAxis = d3.axisLeft(yAxisScale).tickFormat(timeFormat);
        svgContainer.append('g')
        .attr('transform', `translate(${padding * 2}, 0)`)
        .call(yAxis)
        .attr('id', 'y-axis');

        function buildDots(data) {
            const tooltip = d3.select('#graph')
            .append('div')
            .attr('id', 'tooltip');

            svgContainer.selectAll('circle')
            .data(data)
            .enter()
            .append('circle')
            .attr('r', 6)
            .attr('data-xvalue', (d, i) => data[i]['Year'])
            .attr('data-yvalue', (d, i) => dataTime[i])
            .attr('cx', (d, i) => xAxisScale(dataYear[i]) + padding)
            .attr('cy', (d, i) => yAxisScale(dataTime[i]))

            .attr('class', 'dot')
            .attr('fill', (d) => !d.Doping ? 'rgb(159, 210, 255)' : 'rgb(255, 244, 83)')
            .on('mouseover', (e, d) => {
                let index = data.findIndex(obj => obj === d);
                let nameAtIndex = data[index]['Name'];
                let yearAtIndex = data[index]['Year'];
                let nationAtIndex = data[index]['Nationality'];
                let timeAtIndex = `${data[index]['Time'].getMinutes()}:${data[index]['Time'].getSeconds()}`;

                tooltip.style('visibility', 'visible')
                .attr('data-year', yearAtIndex)
                .attr('x', dataYear[index])
                .attr('y', dataTime[index])
                .html(
                    `${nameAtIndex} | ${nationAtIndex}<br>${yearAtIndex}<br>Time: ${timeAtIndex}`
                )
                .style('left', `${e.pageX + 12}px`)
                .style('top', `${(e.pageY - 92) < 1 ? e.pageY + 18 : e.pageY - 92}px`);
            })
            .on('mouseout', () => tooltip.style('visibility', 'hidden'));
        }
        buildDots(data)

        function buildLegend() {
            const legendData = [
                ['With doping allegations.', 'rgb(255, 244, 83)'],
                ['No doping allegations.', 'rgb(159, 210, 255)']
            ];

            const legPlaceHolder = svgContainer.append('g')
            .attr('id', 'legend');

            const legend = legPlaceHolder.selectAll('#legend')
            .data(legendData)
            .enter()
            .append('g')
            .attr('transform', (d, i) =>
                `translate(100, ${(svgHeight / 6 - padding * i)})`
            );

            legend.append('rect')
            .attr('x', svgWidth - padding * 7.5)
            .attr('width', 20)
            .attr('height', 20)
            .attr('fill', (d) => d[1])
            .attr('stroke', 'rgb(3, 17, 80)')

            legend.append('text')
            .attr('x', svgWidth - padding * 6.5)
            .attr('y', 18)
            .style('text-anchor', 'start')
            .text((d) => d[0]);
        }
        buildLegend()
    }
    buildScales(data)
}