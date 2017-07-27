import React, { Component } from 'react'
import { extend } from 'lodash'
import { SearchkitManager,SearchkitProvider,
  SearchBox, RefinementListFilter, Pagination,
  HierarchicalMenuFilter, HitsStats, SortingSelector, NoHits,
  ResetFilters, RangeFilter, NumericRefinementListFilter,
  ViewSwitcherHits, ViewSwitcherToggle, DynamicRangeFilter,
  InputFilter, GroupedSelectedFilters,
  Layout, TopBar, LayoutBody, LayoutResults,
  ActionBar, ActionBarRow, SideBar } from 'searchkit'
import './index.css'

const host = "https://search-unterrichtsmaterial-jxctov2kzuvuscfmz3mrexpkcq.eu-central-1.es.amazonaws.com"
const searchkit = new SearchkitManager(host)

const MovieHitsGridItem = (props)=> {
  const {bemBlocks, result} = props

  const source = extend({}, result._source, result.highlight)
  // console.log(source);

  let url = "https://unterrichtsmaterial.ch/"
  if (source.contents && source.contents.originalFile && source.contents.originalFile.path) {
    url = "https://unterrichtsmaterial.ch" + source.contents.originalFile.path
  }
  
  let thumb = "https://unterrichtsmaterial.ch"
  if (source.contents && source.contents.previewImage && source.contents.previewImage.small) {
    thumb = "https://unterrichtsmaterial.ch" + result._source.contents.previewImage.small
  }

  return (
    <div className={bemBlocks.item().mix(bemBlocks.container("item"))} data-qa="hit">
      <a href={url} target="_blank">
        <img data-qa="poster" alt="presentation" className={bemBlocks.item("poster")} src={thumb} width="170" height="240"/>
        <div data-qa="title" className={bemBlocks.item("title")} dangerouslySetInnerHTML={{__html:source.meta.subject}}></div>
        <div data-qa="title" className={bemBlocks.item("title")} dangerouslySetInnerHTML={{__html:source.meta.title}}></div>
      </a>
    </div>
  )
}

const MovieHitsListItem = (props)=> {
  const {bemBlocks, result} = props

  const source = extend({}, result._source, result.highlight)

  let url = "https://unterrichtsmaterial.ch/"
  if (source.contents && source.contents.originalFile && source.contents.originalFile.path) {
    url = "https://unterrichtsmaterial.ch" + source.contents.originalFile.path
  }
  
  let thumb = "https://unterrichtsmaterial.ch"
  if (source.contents && source.contents.previewImage && source.contents.previewImage.small) {
    thumb = "https://unterrichtsmaterial.ch" + result._source.contents.previewImage.small
  }

  return (
    <div className={bemBlocks.item().mix(bemBlocks.container("item"))} data-qa="hit">
      <div className={bemBlocks.item("poster")}>
        <img alt="presentation" data-qa="poster" src={thumb}/>
      </div>
      <div className={bemBlocks.item("details")}>
        <a href={url} target="_blank"><h2 className={bemBlocks.item("title")} dangerouslySetInnerHTML={{__html:source.meta.title}}></h2></a>
        <h3 className={bemBlocks.item("subtitle")}>{source.meta.subject}, {source.meta.grade}, Bewertung:{source.meta.ratingNr}</h3>
        <h3 className={bemBlocks.item("subtitle")}>Views: {source.stats.views}, Downloads: {source.stats.downloads}</h3>
        <h3 className={bemBlocks.item("subtitle")}>Autor: {source.author.name}</h3>
        <div className={bemBlocks.item("text")} dangerouslySetInnerHTML={{__html:source.meta.text}}></div>
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
            <SearchBox autofocus={true} searchOnChange={true} prefixQueryFields={["meta.title^5","meta.text^1"]}/>
          </TopBar>
          <LayoutBody>

            <SideBar>
              <HierarchicalMenuFilter fields={["meta.subject", "meta.topic"]} title="Fach" id="subject" size={10}/>
              <RefinementListFilter id="grade" title="Schuljahr" field="meta.grade" operator="OR" size={5}/>
              <RangeFilter min={0} max={150} id="numDownloads" title="Downloads" field="stats.downloads" showHistogram={true}/>
              <RangeFilter min={0} max={1500} id="numViews" title="Views" field="stats.views" showHistogram={true}/>
              <RangeFilter min={0} max={5} id="score" title="Bewertung" field="meta.ratingNr"/>
              <InputFilter id="author" title="Autor" searchThrottleTime={500} placeholder="Nach Autor suchen" searchOnChange={true} queryFields={["author.name"]} />
              <RefinementListFilter id="authorList" field="author.name.raw" size={10}/>
              
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
                  hitsPerPage={12} highlightFields={["meta.title","meta.text"]}
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
