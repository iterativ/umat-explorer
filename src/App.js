import React, { Component } from 'react'
import { extend } from 'lodash'
import { SearchkitManager,SearchkitProvider,
  SearchBox, RefinementListFilter, Pagination,
  MenuFilter, HierarchicalMenuFilter, HitsStats, SortingSelector, NoHits,
  ResetFilters, RangeFilter, NumericRefinementListFilter,
  ViewSwitcherHits, ViewSwitcherToggle, DynamicRangeFilter,
  InputFilter, GroupedSelectedFilters, TagCloud,
  Layout, TopBar, LayoutBody, LayoutResults,
  ActionBar, ActionBarRow, SideBar } from 'searchkit'
import './index.css'

const host = "https://search-unterrichtsmaterial-jxctov2kzuvuscfmz3mrexpkcq.eu-central-1.es.amazonaws.com"
const searchkit = new SearchkitManager(host)

// build a document url with a default
const documentUrl = (source) => {
  let url = "https://unterrichtsmaterial.ch/"
  if (source.contents && source.contents.originalFile && source.contents.originalFile.path) {
    url = "https://unterrichtsmaterial.ch" + source.contents.originalFile.path
  }
  return url
}

const thumbUrl = (source) => {
  let thumb = "https://unterrichtsmaterial.ch"
  if (source.contents && source.contents.previewImage && source.contents.previewImage.small) {
    thumb = "https://unterrichtsmaterial.ch" + source.contents.previewImage.small
  }
  return thumb
}

const extractTitle = (source) => {
  return source['meta.title'] ? source['meta.title'] : source.meta.title;
}

const MovieHitsGridItem = (props)=> {
  const {bemBlocks, result} = props

  const source = extend({}, result._source, result.highlight)

  let url = documentUrl(source)
  let thumb = thumbUrl(source)
  let title = extractTitle(source)
  
  return (
    <div className={bemBlocks.item().mix(bemBlocks.container("item"))} data-qa="hit">
      <a href={url} target="_blank">
        <img data-qa="poster" alt="presentation" className={bemBlocks.item("poster")} src={thumb} width="170" height="240"/>
        <div data-qa="title" className={bemBlocks.item("title")} dangerouslySetInnerHTML={{__html:source.meta.subject}}></div>
        <div data-qa="title" className={bemBlocks.item("title")} dangerouslySetInnerHTML={{__html:title}}></div>
      </a>
    </div>
  )
}

const MovieHitsListItem = (props)=> {
  const {bemBlocks, result} = props

  const source = extend({}, result._source, result.highlight)

  let url = documentUrl(source)
  let thumb = thumbUrl(source)
  let title = extractTitle(source)

  return (
    <div className={bemBlocks.item().mix(bemBlocks.container("item"))} data-qa="hit">
      <div className={bemBlocks.item("poster")}>
        <img alt="presentation" data-qa="poster" src={thumb}/>
      </div>
      <div className={bemBlocks.item("details")}>
        <a href={url} target="_blank"><h2 className={bemBlocks.item("title")} dangerouslySetInnerHTML={{__html:title}}></h2></a>
        <h3 className={bemBlocks.item("subtitle")}>{source.meta.subject}, {source.meta.grade}, Bewertung:{source.meta.ratingNr}</h3>
        <h3 className={bemBlocks.item("subtitle")}>Views: {source.stats.views}, Downloads: {source.stats.downloads}</h3>
        <h3 className={bemBlocks.item("subtitle")}>Autor: {source.author.name}</h3>
        <h3 className={bemBlocks.item("subtitle")}>Text:</h3>
        <div className={bemBlocks.item("text")} dangerouslySetInnerHTML={{__html:source['meta.text']}}></div>
        <h3 className={bemBlocks.item("subtitle")}>Ausschnitt:</h3>
        <div className={bemBlocks.item("text")} dangerouslySetInnerHTML={{__html:source['contents.extractedText']}}></div>
      </div>
    </div>
  )
}

class App extends Component {
  render() {
    return (
      <SearchkitProvider searchkit={searchkit}>
        <Layout>
          <TopBar>
            <SearchBox autofocus={true} searchOnChange={true} prefixQueryFields={["meta.title^50","meta.text^15", "contents.extractedText^1"]}/>
          </TopBar>
          <LayoutBody>

            <SideBar>
              <HierarchicalMenuFilter fields={["meta.subject", "meta.topic"]} title="Fach" id="subject" size={10}/>
              <RefinementListFilter id="grade" title="Schuljahr" field="meta.grade" operator="OR" size={5}/>
              <DynamicRangeFilter min={0} max={150} id="numDownloads" title="Downloads" field="stats.downloads" showHistogram={true}/>
              <DynamicRangeFilter min={0} max={1500} id="numViews" title="Views" field="stats.views" showHistogram={true}/>
              <RangeFilter min={0} max={5} id="score" title="Bewertung" field="meta.ratingNr"/>
              <MenuFilter field={"meta.title"} title="Wörter" id="tag-cloud" listComponent={TagCloud} size={20}/>
              <InputFilter id="author" title="Autor" searchThrottleTime={500} placeholder="Nach Autor suchen" searchOnChange={true} queryFields={["author.name"]} />
              <RefinementListFilter id="authorList" title="Autor" field="author.name.raw" size={10}/>
              
            </SideBar>
            <LayoutResults>
              <ActionBar>

                <ActionBarRow>
                  <HitsStats translations={{
                    "hitstats.results_found":"{hitCount} results found"
                  }}/>
                  <ViewSwitcherToggle/>
                  <SortingSelector options={[
                    {label:"Bewertung", field:"meta.ratingNr", order:"desc"},
                    {label:"Downloads", field:"stats.downloads", order:"desc"},
                    {label:"Views", field:"stats.views", order:"desc"},
                    {label:"Zuletzt Aufgeschaltet", field:"stats.publicationDate", order:"desc"},
                    {label:"Zuerst Aufgeschaltet", field:"stats.publicationDate", order:"asc"}
                  ]}/>
                </ActionBarRow>

                <ActionBarRow>
                  <GroupedSelectedFilters/>
                  <ResetFilters/>
                </ActionBarRow>

              </ActionBar>
              <ViewSwitcherHits
                  hitsPerPage={12} highlightFields={["meta.title","meta.text", "contents.extractedText"]}
                  //sourceFilter={["plot", "title", "poster", "imdbId", "imdbRating", "year"]}
                  hitComponents={[
                    {key:"grid", title:"Grid", itemComponent:MovieHitsGridItem, defaultOption:true},
                    {key:"list", title:"List", itemComponent:MovieHitsListItem}
                  ]}
                  scrollTo="body"
              />
              <NoHits suggestionsField={"meta.title"}/>
              <Pagination showNumbers={true}/>
            </LayoutResults>

          </LayoutBody>
        </Layout>
      </SearchkitProvider>
    );
  }
}

export default App;
