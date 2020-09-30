import {toStr} from '/lib/util';
import {
	create as createContent,
	query as queryContent
} from '/lib/xp/content';
import {run} from '/lib/xp/context';
import {
	connect,
	multiRepoConnect
} from '/lib/xp/node';
import {create as createRepo} from '/lib/xp/repo';
import {submit} from '/lib/xp/task';

const REPO_ID_1 = `${app.name}.1`;
const REPO_ID_2 = `${app.name}.2`;
const LORUM = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';
const QUERY_PARAMS = {
	aggregations: {},
	count: -1,
	explain: true,
	filters: {},
	highlight: {
		//encoder: '' // Indicates if the snippet should be HTML encoded: default (no encoding) or html.
		fragmentSize: 100, // The size of the highlighted fragment in characters. Defaults to 100.
		fragmenter: 'simple',
		//fragmenter: 'span',
		noMatchSize: 10, // The amount of characters you want to return from the beginning of the property if there are no matching fragments to highlight. Defaults to 0 (nothing is returned).
		numberOfFragments: 5, // The maximum number of fragments to return. If numberOfFragments is 0, no fragments will be returned and fragmentSize will be ignored. Defaults to 5.
		order: 'none', // Sorts highlighted fragments by score when set to score. Defaults to none - will be displayed in the same order in which fragments appear in the property.
		//order: 'score',
		postTag: '</b>',
		preTag: '<b>',
		properties: {
			_allText: {
				//encoder: '',
				fragmenter: 'simple',
				fragmentSize: 100,
				order: 'none',
				noMatchSize: 10,
				numberOfFragments: 5,
				postTag: '</b>',
				preTag: '<b>',
				requireFieldMatch: false,
				tagsSchema: 'styled'
			},
			'data.text': {
				//encoder: '',
				fragmenter: 'simple',
				fragmentSize: 100,
				order: 'none',
				noMatchSize: 10,
				numberOfFragments: 5,
				postTag: '</b>',
				preTag: '<b>',
				requireFieldMatch: false,
				tagsSchema: 'styled'
			},
			data: {
				//encoder: '',
				fragmenter: 'simple',
				fragmentSize: 100,
				order: 'none',
				noMatchSize: 10,
				numberOfFragments: 5,
				postTag: '</b>',
				preTag: '<b>',
				requireFieldMatch: false,
				tagsSchema: 'styled'
			}
		},
		requireFieldMatch: false, // requireFieldMatch can be set to false which will cause any property to be highlighted regardless of whether its value matches the query. The default behaviour is true, meaning that only properties that match the query will be highlighted.
		tagsSchema: 'styled' // Set to styled to use the built-in tag schema.
	},
	query: "fulltext('_allText', 'amet') OR fulltext('data.text', 'amet') OR fulltext('data', 'amet')",
	sort: 'score DESC',
	start: 0
};

function task() {
	run({
		repository: 'com.enonic.cms.default',
		branch: 'draft',
		principals: ['role:system.admin']
	}, () => {
		const createSiteParams = {
			parentPath: '/',
			name: 'highlightSite',
			contentType: 'portal:site',
			data: {}
			//data: LORUM // Doesn't work
		};
		log.debug(`createSiteParams:${toStr(createSiteParams)}`);
		try {
			const createSiteRes = createContent(createSiteParams);
			log.debug(`createSiteRes:${toStr(createSiteRes)}`);
		} catch (e) {
			if (e.class.name !== 'com.enonic.xp.content.ContentAlreadyExistsException') {
				log.error(`e.class.name:${toStr(e.class.name)} e.message:${toStr(e.message)}`, e);
			}
		}

		const createContentParams = {
			parentPath: '/highlightSite',
			name: 'highlightContent',
			//contentType: 'base:structured', // e.class.name:"java.lang.IllegalArgumentException" e.message:"Cannot create content with an abstract type [base:structured]"
			//contentType: 'base:unstructured',
			contentType: `${app.name}:highlight`,
			data: {
				text: LORUM
			}
		};
		log.debug(`createContentParams:${toStr(createContentParams)}`);
		try {
			const createContentRes = createContent(createContentParams);
			log.debug(`createContentRes:${toStr(createContentRes)}`);
		} catch (e) {
			if (e.class.name !== 'com.enonic.xp.content.ContentAlreadyExistsException') {
				log.error(`e.class.name:${toStr(e.class.name)} e.message:${toStr(e.message)}`, e);
			}
		}

		const queryContentRes = queryContent(QUERY_PARAMS);
		log.info(`queryContentRes:${toStr(queryContentRes)}`);
	}); // run cms.default

	run({
		repository: 'system-repo',
		branch: 'master',
		principals: ['role:system.admin']
	}, () => {
		const createRepoParams1 = {
			id: REPO_ID_1
		};
		log.debug(`createRepoParams1:${toStr(createRepoParams1)}`);
		try {
			createRepo(createRepoParams1);
		} catch (e) {
			if (e.class.name !== 'com.enonic.xp.repo.impl.repository.RepositoryAlreadyExistException') {
				log.error(`e.class.name:${toStr(e.class.name)} e.message:${toStr(e.message)}`, e);
			}
		}

		const connectParams1 = {
			branch: 'master',
			repoId: REPO_ID_1,
			principals: ['role:system.admin']
		};
		log.debug(`connectParams1:${toStr(connectParams1)}`);
		const connection1 = connect(connectParams1);

		const createNodeParams1 = {
			_name: '1',
			_path: '/',
			data: LORUM
		};
		log.debug(`createNodeParams1:${toStr(createNodeParams1)}`);
		try {
			connection1.create(createNodeParams1);
		} catch (e) {
			if (e.class.name !== 'com.enonic.xp.node.NodeAlreadyExistAtPathException') {
				log.error(`e.class.name:${toStr(e.class.name)} e.message:${toStr(e.message)}`, e);
			}
		}

		/*const queryParams1 = {
			aggregations: {},
			count: -1,
			highlight: {
				fragmentSize: 15,
				fragmenter: 'simple',
				//fragmenter: 'span',
				numberOfFragments: 2,
				order: 'none',
				//order: 'score',
				postTag: '</b>',
				preTag: '<b>',
				properties: {
					data: {
						fragmentSize: 15,
						numberOfFragments: 2
					}
				},
				requireFieldMatch: false // requireFieldMatch can be set to false which will cause any property to be highlighted regardless of whether its value matches the query. The default behaviour is true, meaning that only properties that match the query will be highlighted.
			},
			query: "fulltext('data', 'amet')",
			sort: 'score DESC',
			start: 0
		};
		log.debug(`queryParams1:${toStr(queryParams1)}`);*/
		const queryRes1 = connection1.query(QUERY_PARAMS);
		log.debug(`queryRes1:${toStr(queryRes1)}`);

		queryRes1.mappedHits = queryRes1.hits.map(({id}) => {
			const node = connection1.get(id);
			return {
				_id: node._id,
				data: node.data
			};
		});
		log.info(`queryRes1:${toStr(queryRes1)}`);

		const createRepoParams2 = {
			id: REPO_ID_2
		};
		log.debug(`createRepoParams2:${toStr(createRepoParams2)}`);
		try {
			createRepo(createRepoParams2);
		} catch (e) {
			if (e.class.name !== 'com.enonic.xp.repo.impl.repository.RepositoryAlreadyExistException') {
				log.error(`e.class.name:${toStr(e.class.name)} e.message:${toStr(e.message)}`, e);
			}
		}

		const connectParams2 = {
			branch: 'master',
			repoId: REPO_ID_2,
			principals: ['role:system.admin']
		};
		log.debug(`connectParams2:${toStr(connectParams2)}`);
		const connection2 = connect(connectParams2);
		const createNodeParams2 = {
			_name: '2',
			_path: '/',
			data: LORUM
		};
		log.debug(`createNodeParams2:${toStr(createNodeParams2)}`);
		try {
			connection2.create(createNodeParams2);
		} catch (e) {
			if (e.class.name !== 'com.enonic.xp.node.NodeAlreadyExistAtPathException') {
				log.error(`e.class.name:${toStr(e.class.name)} e.message:${toStr(e.message)}`, e);
			}
		}

		/*const queryParams2 = {
			aggregations: {},
			count: -1,
			highlight: {
				fragmentSize: 15,
				fragmenter: 'simple',
				//fragmenter: 'span',
				numberOfFragments: 2,
				order: 'none',
				//order: 'score',
				postTag: '</b>',
				preTag: '<b>',
				properties: {
					data: {
						fragmentSize: 15,
						numberOfFragments: 2
					}
				},
				requireFieldMatch: false // requireFieldMatch can be set to false which will cause any property to be highlighted regardless of whether its value matches the query. The default behaviour is true, meaning that only properties that match the query will be highlighted.
			},
			query: "fulltext('data', 'amet')",
			sort: 'score DESC',
			start: 0
		};
		log.debug(`queryParams2:${toStr(queryParams2)}`);*/
		const queryRes2 = connection2.query(QUERY_PARAMS);
		log.debug(`queryRes2:${toStr(queryRes2)}`);

		queryRes2.mappedHits = queryRes2.hits.map(({id}) => {
			const node = connection2.get(id);
			return {
				_id: node._id,
				data: node.data
			};
		});
		log.info(`queryRes2:${toStr(queryRes2)}`);

		const multiRepoConnectParams = {
			sources: [{
				repoId: REPO_ID_1,
				branch: 'master',
				principals: ['role:system.admin']
			}, {
				repoId: REPO_ID_2,
				branch: 'master',
				principals: ['role:system.admin']
			}]
		};
		log.debug(`multiRepoConnectParams:${toStr(multiRepoConnectParams)}`);
		const multiRepoConnection = multiRepoConnect(multiRepoConnectParams);
		/*const multiRepoQueryParams = {
			aggregations: {},
			count: -1,
			highlight: {
				fragmentSize: 15,
				fragmenter: 'simple',
				//fragmenter: 'span',
				numberOfFragments: 2,
				order: 'none',
				//order: 'score',
				postTag: '</b>',
				preTag: '<b>',
				properties: {
					data: {
						fragmentSize: 15,
						numberOfFragments: 2
					}
				},
				requireFieldMatch: false // requireFieldMatch can be set to false which will cause any property to be highlighted regardless of whether its value matches the query. The default behaviour is true, meaning that only properties that match the query will be highlighted.
			},
			query: "fulltext('data', 'amet')",
			sort: 'score DESC',
			start: 0
		};
		log.debug(`multiRepoQueryParams:${toStr(multiRepoQueryParams)}`);*/
		const multiRepoQueryRes = multiRepoConnection.query(QUERY_PARAMS);
		log.debug(`multiRepoQueryRes:${toStr(multiRepoQueryRes)}`);

		multiRepoQueryRes.mappedHits = multiRepoQueryRes.hits.map(({
			branch,
			id,
			repoId
		}) => {
			const singleConnectParams = {
				branch,
				repoId,
				principals: ['role:system.admin']
			};
			log.debug(`singleConnectParams:${toStr(singleConnectParams)}`);
			const singleConnection = connect(singleConnectParams);
			const node = singleConnection.get(id);
			return {
				repoId,
				branch,
				_id: id,
				data: node.data
			};
		});
		log.info(`multiRepoQueryRes:${toStr(multiRepoQueryRes)}`);
		log.info(`QUERY_PARAMS:${toStr(QUERY_PARAMS)}`);
	}); // run
} // function task

submit({
	description: '',
	task
});
