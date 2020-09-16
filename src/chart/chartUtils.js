import * as d3 from "d3";
import * as tsvParse from "d3-dsv";

export const FetchData = async () => {
  const tempData = tsvParse(await FileAttachment("walmart.tsv").text(), (d) => {
    const p = d3.projection(d);
    p.date = d3.parseDate(d.date);
    return p;
  });

  const data = Object.assign(
    d3
      .hexbin(tempData)
      .map((d) => ((d.date = new Date(d3.median(d, (d) => d.date))), d))
      .sort((a, b) => b.length - a.length),
    { title: "Median opening year" }
  );
  return { data };
};
